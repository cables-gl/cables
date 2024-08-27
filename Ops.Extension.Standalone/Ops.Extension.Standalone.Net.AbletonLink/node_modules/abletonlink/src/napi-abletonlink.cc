#include "./napi-abletonlink.hpp"

Napi::Object init(Napi::Env env, Napi::Object exports) {
    napi::AbletonLink<true>::Init(env, exports);
    napi::AbletonLink<false>::Init(env, exports);
    return exports;
}

NODE_API_MODULE(abletonlink, init);
