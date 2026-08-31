// SPDX-License-Identifier: WTFPL

package aenu.aps3e;
import android.view.SurfaceView;
import android.content.Context;
import android.view.SurfaceHolder;
import android.view.Surface;
import android.util.*;
import aenu.aps3e.Emulator;
import android.graphics.*;

public class GameFrameView extends SurfaceView
{
	
    public GameFrameView(Context ctx){
        super(ctx);
    }
	
	public GameFrameView(android.content.Context context, android.util.AttributeSet attrs) {
		super(context,attrs);
        //setLayerType(LAYER_TYPE_SOFTWARE, null);
        // Let Android choose the native window buffer format.  Forcing RGBX here
        // can conflict with Vulkan/gralloc on several Mali/Valhall drivers.
	}

    public GameFrameView(android.content.Context context, android.util.AttributeSet attrs, int defStyleAttr) {
		super(context,attrs,defStyleAttr);

		// Do not force a SurfaceHolder PixelFormat; Vulkan selects the compatible
		// swapchain format for the actual device/display combination.
	}

    public GameFrameView(android.content.Context context, android.util.AttributeSet attrs, int defStyleAttr, int defStyleRes) {
		super(context,attrs,defStyleAttr,defStyleRes);

		// Do not force a SurfaceHolder PixelFormat; Vulkan selects the compatible
		// swapchain format for the actual device/display combination.
	}
};
