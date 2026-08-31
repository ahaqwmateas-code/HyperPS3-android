package com.hyperps3.modern;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;

public class SettingsActivity extends Activity {
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("hyperps3_config", MODE_PRIVATE);

        ScrollView scroll = new ScrollView(this);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 40, 40, 40);
        scroll.addView(layout);
        setContentView(scroll);

        TextView title = new TextView(this);
        title.setText("HyperPS3 Settings");
        title.setTextSize(26);
        title.setPadding(0, 0, 0, 40);
        layout.addView(title);

        // Shader Mode: 0=Async, 1=Async+Interp, 2=Interp, 3=Off
        addSpinner(layout, "Shader Mode", "shader_mode",
            new String[]{"Async (Fast)", "Async + Interpreter", "Interpreter Only", "Off (No Shaders)"}, 1);

        addSpinner(layout, "Renderer", "renderer",
            new String[]{"Vulkan", "OpenGL ES"}, 0);

        addCheckbox(layout, "Write Color Buffers", "write_color_buffers", true);
        addCheckbox(layout, "Read Color Buffers", "read_color_buffers", true);
        addCheckbox(layout, "Write Depth Buffer", "write_depth_buffer", true);
        addCheckbox(layout, "Strict Rendering Mode", "strict_rendering_mode", true);
        addCheckbox(layout, "Disable Vertex Cache", "disable_vertex_cache", false);
        addCheckbox(layout, "Multithreaded RSX", "multithreaded_rsx", true);
        addCheckbox(layout, "Relaxed ZCULL", "relaxed_zcull", true);
        addCheckbox(layout, "VSync", "vsync", false);
        addCheckbox(layout, "Frame Limit", "frame_limit", false);

        addSpinner(layout, "Resolution Scale", "resolution_scale",
            new String[]{"25%", "50%", "75%", "100% (Native)", "125%", "150%", "200%"}, 3);

        addSpinner(layout, "Anisotropic Filter", "anisotropic_filter",
            new String[]{"Off", "2x", "4x", "8x", "16x"}, 0);

        addCheckbox(layout, "Anti-Aliasing", "anti_aliasing", false);
        addCheckbox(layout, "Shader Cache", "shader_cache", true);
        addCheckbox(layout, "Pipeline Cache", "pipeline_cache", true);
        addCheckbox(layout, "Force High GPU Precision", "force_highp", true);
        addCheckbox(layout, "Log Shaders", "log_shaders", false);
        addCheckbox(layout, "Debug Overlay", "debug_overlay", true);

        Button save = new Button(this);
        save.setText("SAVE & APPLY");
        save.setOnClickListener(v -> {
            applyNativeSettings();
            Toast.makeText(this, "Settings saved. Restart game to apply.", Toast.LENGTH_LONG).show();
            finish();
        });
        layout.addView(save);
    }

    private void addCheckbox(LinearLayout parent, String label, String key, boolean defaultVal) {
        CheckBox cb = new CheckBox(this);
        cb.setText(label);
        cb.setChecked(prefs.getBoolean(key, defaultVal));
        cb.setOnCheckedChangeListener((btn, checked) -> prefs.edit().putBoolean(key, checked).apply());
        parent.addView(cb);
    }

    private void addSpinner(LinearLayout parent, String label, String key, String[] items, int defaultIdx) {
        TextView tv = new TextView(this);
        tv.setText(label);
        tv.setPadding(0, 24, 0, 12);
        parent.addView(tv);

        Spinner spinner = new Spinner(this);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, items);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setSelection(prefs.getInt(key, defaultIdx));
        spinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            public void onItemSelected(android.widget.AdapterView<?> p, android.view.View v, int pos, long id) {
                prefs.edit().putInt(key, pos).apply();
            }
            public void onNothingSelected(android.widget.AdapterView<?> p) {}
        });
        parent.addView(spinner);
    }

    private void applyNativeSettings() {
        nativeApplySettings(
            prefs.getInt("shader_mode", 1),
            prefs.getInt("renderer", 0),
            prefs.getBoolean("write_color_buffers", true),
            prefs.getBoolean("read_color_buffers", true),
            prefs.getBoolean("write_depth_buffer", true),
            prefs.getBoolean("strict_rendering_mode", true),
            prefs.getBoolean("disable_vertex_cache", false),
            prefs.getBoolean("multithreaded_rsx", true),
            prefs.getBoolean("relaxed_zcull", true),
            prefs.getBoolean("vsync", false),
            prefs.getBoolean("frame_limit", false),
            prefs.getInt("resolution_scale", 3),
            prefs.getInt("anisotropic_filter", 0),
            prefs.getBoolean("anti_aliasing", false),
            prefs.getBoolean("shader_cache", true),
            prefs.getBoolean("pipeline_cache", true),
            prefs.getBoolean("force_highp", true),
            prefs.getBoolean("log_shaders", false),
            prefs.getBoolean("debug_overlay", true)
        );
    }

    static { System.loadLibrary("hyperps3-native"); }
    native void nativeApplySettings(int shaderMode, int renderer, boolean writeColor, boolean readColor,
        boolean writeDepth, boolean strictMode, boolean disableVtxCache, boolean mtRSX,
        boolean relaxedZcull, boolean vsync, boolean frameLimit, int resScale,
        int anisoFilter, boolean antiAliasing, boolean shaderCache, boolean pipelineCache,
        boolean forceHighp, boolean logShaders, boolean debugOverlay);
}
