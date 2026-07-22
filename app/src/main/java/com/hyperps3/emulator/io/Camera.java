// SPDX-License-Identifier: WTFPL
package com.hyperps3.emulator.io;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.ImageFormat;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CaptureRequest;
import android.media.Image;
import android.media.ImageReader;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;
import android.view.Surface;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import java.nio.ByteBuffer;
import java.util.Arrays;

import com.hyperps3.emulator.Emulator;

public class Camera {

    private static final String TAG = "aps3e.Camera";
    private Context context_;
    private CameraManager camera_manager_;
    private CameraDevice camera_device_;
    private CameraCaptureSession capture_session_;
    private ImageReader image_reader_;

    private Handler background_handler_;

    private String camera_id_;
    private int width_ = 640;
    private int height_ = 480;
    private int format_ = ImageFormat.YUV_420_888;
    private int native_format_;
    private int frame_rate_ = 30;
    private boolean mirrored_ = false;

    long native_handler_;


    private final ImageReader.OnImageAvailableListener on_image_available_listener_ =
            new ImageReader.OnImageAvailableListener() {

                private void processImage(Image image) {
                    
                    int width = image.getWidth();
                    int height = image.getHeight();
                    int format = image.getFormat();

                    Image.Plane[] planes = image.getPlanes();
                    if (planes.length == 0) {
                        return;
                    }

                    ByteBuffer buffer = planes[0].getBuffer();
                    int pixelStride = planes[0].getPixelStride();
                    int rowStride = planes[0].getRowStride();
                    int rowPadding = rowStride - pixelStride * width;

                    int bufferSize = buffer.remaining();

                    byte[] imageData = new byte[bufferSize];
                    buffer.get(imageData);

                    Emulator.get.camera_frame(imageData, width, height, native_format_);
                }

                @Override
                public void onImageAvailable(ImageReader reader) {
                    Image image = null;
                    try {
                        image = reader.acquireLatestImage();
                        if (image != null) {
                            processImage(image);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing image", e);
                    } finally {
                        if (image != null) {
                            image.close();
                        }
                    }
                }
            };
    private final CameraDevice.StateCallback state_callback_ = new CameraDevice.StateCallback() {
        @Override
        public void onOpened(@NonNull CameraDevice camera) {
            camera_device_ = camera;
            Log.i(TAG, "Camera opened successfully");
        }

        @Override
        public void onDisconnected(@NonNull CameraDevice camera) {
            Log.w(TAG, "Camera disconnected");
            camera.close();
            camera_device_ = null;
        }

        @Override
        public void onError(@NonNull CameraDevice camera, int error) {
            Log.e(TAG, "Camera error: " + error);
            camera.close();
            camera_device_ = null;
        }
    };

    public Camera(Context context) {
        Log.i(TAG, "Camera created");
        initialize( context);
    }

    public void initialize(Context context) {
        context_ = context.getApplicationContext();
        camera_manager_ = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
        Log.i(TAG, "Camera initialized with context");
    }

    public void open_camera() {
        if (context_ == null) {
            throw new RuntimeException();
        }

        try {
            camera_id_ = get_back_facing_camera_id();
            if (camera_id_ == null) {
                camera_id_ = get_front_facing_camera_id();
            }

            if (camera_id_ == null) {
                Log.e(TAG, "No camera found");
                return;
            }

            Log.i(TAG, "Opening camera: " + camera_id_);

            if (ActivityCompat.checkSelfPermission(context_, Manifest.permission.CAMERA)
                    != PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, "Camera permission not granted");
                return;
            }

            image_reader_ = ImageReader.newInstance(width_, height_, format_, 2);
            image_reader_.setOnImageAvailableListener(on_image_available_listener_, background_handler_);

            camera_manager_.openCamera(camera_id_, state_callback_, background_handler_);

        } catch (CameraAccessException e) {
            Log.e(TAG, "Failed to open camera", e);
        }
    }

    public void close_camera() {
        Log.i(TAG, "Closing camera");

        if (capture_session_ != null) {
            capture_session_.close();
            capture_session_ = null;
        }

        if (camera_device_ != null) {
            camera_device_.close();
            camera_device_ = null;
        }

        if (image_reader_ != null) {
            image_reader_.close();
            image_reader_ = null;
        }
    }

    public void start_camera() {
        Log.i(TAG, "Starting camera preview");

        if (camera_device_ == null) {
            Log.e(TAG, "Camera not opened");
            return;
        }

        try {
            start_preview();
        } catch (CameraAccessException e) {
            Log.e(TAG, "Failed to start preview", e);
        }
    }

    public void stop_camera() {
        Log.i(TAG, "Stopping camera preview");
        if (capture_session_ != null) {
            capture_session_.close();
            capture_session_ = null;
        }
    }

    private void start_preview() throws CameraAccessException {
        if (camera_device_ == null || image_reader_ == null) {
            return;
        }

        Surface surface = image_reader_.getSurface();

        CaptureRequest.Builder preview_request_builder =
                camera_device_.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
        preview_request_builder.addTarget(surface);

        camera_device_.createCaptureSession(
                Arrays.asList(surface),
                new CameraCaptureSession.StateCallback() {
                    @Override
                    public void onConfigured(@NonNull CameraCaptureSession session) {
                        capture_session_ = session;
                        try {
                            preview_request_builder.set(CaptureRequest.CONTROL_AF_MODE,
                                    CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE);
                            preview_request_builder.set(CaptureRequest.CONTROL_AE_MODE,
                                    CaptureRequest.CONTROL_AE_MODE_ON_AUTO_FLASH);

                            capture_session_.setRepeatingRequest(
                                    preview_request_builder.build(), null, background_handler_);
                            Log.i(TAG, "Preview started successfully");
                        } catch (CameraAccessException e) {
                            Log.e(TAG, "Failed to set repeating request", e);
                        }
                    }

                    @Override
                    public void onConfigureFailed(@NonNull CameraCaptureSession session) {
                        Log.e(TAG, "Preview configuration failed");
                    }
                },
                background_handler_
        );
    }

    public void start_background_thread(){
        if (background_handler_ == null) {
            HandlerThread backgroundThread = new HandlerThread("CameraBackground");
            backgroundThread.start();
            background_handler_ = new Handler(backgroundThread.getLooper());
            Log.i(TAG, "Background thread started");
        }
    }

    public void stop_background_thread(){
        if (background_handler_ != null) {
            background_handler_.getLooper().quitSafely();
            try {
                background_handler_.getLooper().getThread().join();
            } catch (InterruptedException e) {
                Log.e(TAG, "Error stopping background thread", e);
            }
            background_handler_ = null;
            Log.i(TAG, "Background thread stopped");
        }
    }

    // Called from native code to set the native handler pointer
    public void set_native_handler(long handler) {
        native_handler_ = handler;
        Log.i(TAG, "Native handler set: " + handler);
    }


    //native call
    public void set_resolution(int width, int height) {
        Log.i(TAG, "Setting resolution: " + width + " x " + height);
        width_ = width;
        height_ = height;

        if (image_reader_ != null) {
            image_reader_.close();
            image_reader_ = ImageReader.newInstance(width_, height_, format_, 2);
            image_reader_.setOnImageAvailableListener(on_image_available_listener_, background_handler_);
        }
    }
    //native call
    public void set_format(int format) {
        Log.i(TAG, "Setting format: " + format);
        /*
        * enum CellCameraFormat : s32
{
	CELL_CAMERA_FORMAT_UNKNOWN,
	CELL_CAMERA_JPG,
	CELL_CAMERA_RAW8,
	CELL_CAMERA_YUV422,
	CELL_CAMERA_RAW10,
	CELL_CAMERA_RGBA,
	CELL_CAMERA_YUV420,
	CELL_CAMERA_V_Y1_U_Y0,
	CELL_CAMERA_Y0_U_Y1_V = CELL_CAMERA_YUV422,
};
        * */
        native_format_ = format;
        switch (format) {
            case 1: // CELL_CAMERA_JPG
                format_ = ImageFormat.JPEG;
                break;
            case 2: // CELL_CAMERA_RAW8
                format_ = ImageFormat.YUV_420_888;
                break;
            case 3: // CELL_CAMERA_YUV422
                format_ = ImageFormat.YUY2;
                break;
            case 5: // CELL_CAMERA_RGBA
                format_ = ImageFormat.FLEX_RGBA_8888;
                break;
            case 6: // CELL_CAMERA_YUV420
                format_ = ImageFormat.YUV_420_888;
                break;
            default:
                format_ = ImageFormat.YUV_420_888;
                break;
        }
    }

    //native call
    public void set_mirrored(boolean mirrored) {
        Log.i(TAG, "Setting mirrored: " + mirrored);
        mirrored_ = mirrored;
    }

    private String get_back_facing_camera_id() throws CameraAccessException {
        for (String cameraId : camera_manager_.getCameraIdList()) {
            CameraCharacteristics characteristics =
                    camera_manager_.getCameraCharacteristics(cameraId);
            Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
            if (facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) {
                return cameraId;
            }
        }
        return null;
    }

    private String get_front_facing_camera_id() throws CameraAccessException {
        for (String cameraId : camera_manager_.getCameraIdList()) {
            CameraCharacteristics characteristics =
                    camera_manager_.getCameraCharacteristics(cameraId);
            Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
            if (facing != null && facing == CameraCharacteristics.LENS_FACING_FRONT) {
                return cameraId;
            }
        }
        return null;
    }
}
