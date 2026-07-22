// SPDX-License-Identifier: WTFPL

package com.hyperps3.emulator;
import android.view.SurfaceView;
import android.content.Context;
import android.view.SurfaceHolder;
import android.view.Surface;
import android.util.*;
import com.hyperps3.emulator.Emulator;
import android.graphics.*;

public class GameFrameView extends SurfaceView
{
	
    public GameFrameView(Context ctx){
        super(ctx);
    }
	
	public GameFrameView(android.content.Context context, android.util.AttributeSet attrs) {
		super(context,attrs);
        //setLayerType(LAYER_TYPE_SOFTWARE, null);
        getHolder().setFormat(PixelFormat.RGBX_8888);
	}

    public GameFrameView(android.content.Context context, android.util.AttributeSet attrs, int defStyleAttr) {
		super(context,attrs,defStyleAttr);

		getHolder().setFormat(PixelFormat.RGBX_8888);
	}

    public GameFrameView(android.content.Context context, android.util.AttributeSet attrs, int defStyleAttr, int defStyleRes) {
		super(context,attrs,defStyleAttr,defStyleRes);

		getHolder().setFormat(PixelFormat.RGBX_8888);
	}
};
