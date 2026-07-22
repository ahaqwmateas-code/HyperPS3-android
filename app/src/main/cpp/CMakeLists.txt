# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html.

cmake_minimum_required(VERSION 3.22.1)

project("aps3e" LANGUAGES C CXX)

add_compile_options(-march=armv8-a)
add_compile_options(-stdlib=libc++)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)

add_link_options(-Wl,-z,max-page-size=16384)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(lang_System SHARED lang_System.cpp)

add_library(hardware_ProcessorInfo SHARED hardware_ProcessorInfo.cpp)
target_link_libraries(hardware_ProcessorInfo PRIVATE vulkan)

add_subdirectory(rpcs3 EXCLUDE_FROM_ALL)

add_library(emu SHARED)

set_target_properties(emu PROPERTIES OUTPUT_NAME "e")

target_link_options(emu PRIVATE -Wl,--exclude-libs,ALL)

target_sources(emu
        PRIVATE
        rpcs3/rpcs3/Input/raw_mouse_config.cpp
        rpcs3/rpcs3/Input/raw_mouse_handler.cpp
        rpcs3/rpcs3/Input/product_info.cpp
        rpcs3/rpcs3/rpcs3_version.cpp
        rpcs3/rpcs3/stb_image.cpp
        rpcs3/rpcs3/stdafx.cpp
        aps3e_rp3_impl.cpp
        aps3e_emu.cpp
        aps3e.cpp
        vkapi.cpp
        vkutil.cpp
        cpuinfo.cpp
        glsl2spv.cpp
        meminfo.cpp
        emulator.cpp
        emulator_aps3e.cpp
)

target_link_libraries(emu PRIVATE
        rpcs3_emu
        3rdparty::yaml-cpp
        3rdparty::hidapi
        3rdparty::libusb
        3rdparty::wolfssl
        3rdparty::libcurl
        android
)
