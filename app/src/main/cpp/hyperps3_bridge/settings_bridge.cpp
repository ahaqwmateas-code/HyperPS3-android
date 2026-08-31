#include <jni.h>
#include <android/log.h>

#define LOG_TAG "HYPERPS3"

struct EmulatorConfig {
    int shader_mode = 1;
    int renderer = 0;
    bool write_color_buffers = true;
    bool read_color_buffers = true;
    bool write_depth_buffer = true;
    bool strict_rendering_mode = true;
    bool disable_vertex_cache = false;
    bool multithreaded_rsx = true;
    bool relaxed_zcull = true;
    bool vsync = false;
    bool frame_limit = false;
    int resolution_scale = 3;
    int anisotropic_filter = 0;
    bool anti_aliasing = false;
    bool shader_cache = true;
    bool pipeline_cache = true;
    bool force_highp = true;
    bool log_shaders = false;
    bool debug_overlay = true;
} g_config;

extern "C" JNIEXPORT void JNICALL
Java_com_hyperps3_modern_SettingsActivity_nativeApplySettings(JNIEnv* env, jobject thiz,
    jint shaderMode, jint renderer, jboolean writeColor, jboolean readColor,
    jboolean writeDepth, jboolean strictMode, jboolean disableVtxCache, jboolean mtRSX,
    jboolean relaxedZcull, jboolean vsync, jboolean frameLimit, jint resScale,
    jint anisoFilter, jboolean antiAliasing, jboolean shaderCache, jboolean pipelineCache,
    jboolean forceHighp, jboolean logShaders, jboolean debugOverlay)
{
    g_config.shader_mode = shaderMode;
    g_config.renderer = renderer;
    g_config.write_color_buffers = writeColor;
    g_config.read_color_buffers = readColor;
    g_config.write_depth_buffer = writeDepth;
    g_config.strict_rendering_mode = strictMode;
    g_config.disable_vertex_cache = disableVtxCache;
    g_config.multithreaded_rsx = mtRSX;
    g_config.relaxed_zcull = relaxedZcull;
    g_config.vsync = vsync;
    g_config.frame_limit = frameLimit;
    g_config.resolution_scale = resScale;
    g_config.anisotropic_filter = anisoFilter;
    g_config.anti_aliasing = antiAliasing;
    g_config.shader_cache = shaderCache;
    g_config.pipeline_cache = pipelineCache;
    g_config.force_highp = forceHighp;
    g_config.log_shaders = logShaders;
    g_config.debug_overlay = debugOverlay;

    __android_log_print(ANDROID_LOG_INFO, LOG_TAG,
        "Settings: shader=%d renderer=%d strict=%d highp=%d",
        shaderMode, renderer, strictMode, forceHighp);
}

const EmulatorConfig& get_emulator_config() {
    return g_config;
}
