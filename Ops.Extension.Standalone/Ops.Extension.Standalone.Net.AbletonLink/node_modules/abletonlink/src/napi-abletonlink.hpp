#pragma once

#if defined(BOOST_NO_ANSI_APIS) || (defined(_MSC_VER) && (_MSC_VER >= 1800))
#   include <malloc.h>
#endif

#include <napi.h>

#include <ableton/Link.hpp>

#include <memory>
#include <queue>
#include <mutex>
#include <type_traits>

namespace napi {
    static Napi::Boolean toNapi(const Napi::Env &env, bool b)
    { return Napi::Boolean::New(env, b); };

    template <typename type>
    static auto toNapi(const Napi::Env &env, type v)
        -> typename std::enable_if<
            !std::is_same<type, bool>::value && std::is_arithmetic<type>::value,
            Napi::Number
        >::type
    { return Napi::Number::New(env, v); };

    template <typename type>
    static auto toNapi(const Napi::CallbackInfo &info, type v)
        -> decltype(toNapi(info.Env(), v))
    { return toNapi(info.Env(), v); };

    template <typename type>
    using ToValue = Napi::Value;

    template <bool is_audio_thread>
    class AbletonLink : public Napi::ObjectWrap<AbletonLink<is_audio_thread>>
    {
        struct ALTempoQueue {
            AbletonLink *that;
            double bpm;
        };
        struct ALNumPeersQueue {
            AbletonLink *that;
            std::size_t numPeers;
        };
        struct ALPlayingQueue {
            AbletonLink *that;
            bool isPlaying;
        };

        static std::mutex &bbb_mutex() {
            static std::mutex _;
            return _;
        }
        static std::queue<ALTempoQueue> &bbb_tempo_queue() {
            static std::queue<ALTempoQueue> _;
            return _;
        }
        static std::queue<ALNumPeersQueue> &bbb_peers_queue() {
            static std::queue<ALNumPeersQueue> _;
            return _;
        }
        static std::queue<ALPlayingQueue> &bbb_is_playing_queue() {
            static std::queue<ALPlayingQueue> _;
            return _;
        }

        static void callback_handler() {
            while (true) {
                std::lock_guard<std::mutex> sl(bbb_mutex());
                while(!bbb_tempo_queue().empty()) {
                    auto &&front = bbb_tempo_queue().front();
                    bbb_tempo_queue().pop();
                    if(bbb_tempo_queue().empty()) {
                        front.that->tempoChanged(front.bpm);
                    }
                }
                while(!bbb_peers_queue().empty()) {
                    auto &&front = bbb_peers_queue().front();
                    bbb_peers_queue().pop();
                    if(bbb_peers_queue().empty()) {
                        front.that->numPeersChanged(front.numPeers);
                    }
                }
                while(!bbb_is_playing_queue().empty()) {
                    auto &&front = bbb_is_playing_queue().front();
                    bbb_is_playing_queue().pop();
                    if(bbb_is_playing_queue().empty()) {    
                        front.that->playStateChanged(front.isPlaying);
                    }
                }
                std::this_thread::sleep_for( std::chrono::milliseconds(1) );
           }
        }
        static std::thread &callback_thread() {
            static std::thread th;
            return th;
        }

        std::chrono::microseconds get_time() const
        { return link.clock().micros(); }

        struct scoped_session_state {
            scoped_session_state() = delete;
            scoped_session_state(ableton::Link &link)
            : link(link)
            , sessionState(is_audio_thread ? link.captureAudioSessionState() : link.captureAppSessionState())
            {}
            ~scoped_session_state()
            {
                if(is_audio_thread) {
                    link.commitAudioSessionState(sessionState);
                } else {
                    link.commitAppSessionState(sessionState);
                }
            };

            ableton::Link &link;
            ableton::Link::SessionState sessionState;
            inline ableton::Link::SessionState *operator->()
            { return &sessionState; };
            inline const ableton::Link::SessionState *operator->() const
            { return &sessionState; };
        };

        scoped_session_state get_session_state()
        { return { link }; };

        ableton::Link link;
        double beat{0.0};
        double phase{0.0};
        double bpm{120.0};
        double quantum{4.0};
        bool isPlayingWhenUpdate{false};

        // call from abletonlink
        inline void tempoChanged(double tempo) {
            if(!has_tempoCallback) return;
            napi_status status = tempoCallback.BlockingCall([tempo](Napi::Env env, Napi::Function jsCallback) {
                Napi::HandleScope scope(env);
                jsCallback.Call({ toNapi(env, tempo) });
            });
            if (status != napi_ok) {
                // Handle error
                std::cerr << "error on tempoCallback" << std::endl;
            }
        }

        inline void numPeersChanged(std::size_t num) {
            // if(numPeersCallback.IsEmpty()) return;
            // Napi::Env env = numPeersCallback.Env();
            // Napi::HandleScope scope(env);
            // numPeersCallback.Call({ toNapi(env, num) });

            if(!has_numPeersCallback) return;
            napi_status status = numPeersCallback.BlockingCall([num](Napi::Env env, Napi::Function jsCallback) {
                Napi::HandleScope scope(env);
                jsCallback.Call({ toNapi(env, num) });
            });
            if (status != napi_ok) {
                // Handle error
                std::cerr << "error on numPeersCallback" << std::endl;
            }
        }

        inline void playStateChanged(bool isPlaying) {
            // if(playStateCallback.IsEmpty()) return;
            // Napi::Env env = playStateCallback.Env();
            // Napi::HandleScope scope(env);
            // playStateCallback.Call({ toNapi(env, isPlaying) });

            if(!has_playStateCallback) return;
            napi_status status = playStateCallback.BlockingCall([isPlaying](Napi::Env env, Napi::Function jsCallback) {
                Napi::HandleScope scope(env);
                jsCallback.Call({ toNapi(env, isPlaying) });
            });
            if (status != napi_ok) {
                // Handle error
                std::cerr << "error on playStateCallback" << std::endl;
            }
        }

    public:
        static Napi::Object Init(Napi::Env env, Napi::Object exports) {
            Napi::HandleScope scope(env);

#define IM(name) \
    Napi::ObjectWrap<AbletonLink<is_audio_thread>>::InstanceMethod( #name, &AbletonLink::name )
#define Getter(name, getter) \
    Napi::ObjectWrap<AbletonLink<is_audio_thread>>::InstanceAccessor( #name, &AbletonLink::getter, nullptr )
#define Property(name, getter, setter) \
    Napi::ObjectWrap<AbletonLink<is_audio_thread>>::InstanceAccessor( #name, &AbletonLink::getter, &AbletonLink::setter )

            Napi::Function func = Napi::ObjectWrap<AbletonLink<is_audio_thread>>::DefineClass(
                env,
                is_audio_thread ? "AbletonLinkAudio" : "AbletonLink",
                {
                    IM(getLinkEnable),
                    IM(setLinkEnable),
                    Property(linkEnable, getLinkEnable, setLinkEnable_),
                    // Napi::ObjectWrap<AbletonLink<is_audio_thread>>::InstanceAccessor<&AbletonLink::getLinkEnable, &AbletonLink::setLinkEnable_>("linkEnable"),
                    IM(enable),
                    IM(disable),

                    IM(getIsPlayStateSync),
                    IM(setIsPlayStateSync),
                    Property(isPlayStateSync, getIsPlayStateSync, setIsPlayStateSync_),
                    IM(enablePlayStateSync),
                    IM(disablePlayStateSync),

                    IM(getBeat),
                    IM(setBeat),
                    Property(beat, getBeat, setBeat_),
                    IM(setBeatForce),

                    IM(getPhase),
                    Getter(phase, getPhase),

                    IM(getBpm),
                    IM(setBpm),
                    Property(bpm, getBpm, setBpm_),

                    IM(getIsPlaying),
                    IM(setIsPlaying),
                    Property(isPlaying, getIsPlaying, setIsPlaying_),
                    Getter(isPlayingOnUpdate, getIsPlayingOnUpdate),
                    IM(play),
                    IM(stop),
                    Getter(isPlayingWhenUpdate, getIsPlayingWhenUpdate),

                    IM(getNumPeers),
                    Getter(numPeers, getNumPeers),

                    IM(setQuantum),
                    IM(getQuantum),
                    Property(quantum, getQuantum, setQuantum_),

                    IM(onTempoChanged),
                    IM(onNumPeersChanged),
                    IM(onPlayStateChanged),

                    IM(on),
                    IM(off),

                    IM(update)
                }
            );
#undef IM
#undef Getter
#undef Property

            constructor = Napi::Persistent(func);
            constructor.SuppressDestruct();
            exports.Set(is_audio_thread ? "AbletonLinkAudio" : "AbletonLink",
                        func);
            return exports;
        }

        AbletonLink(const Napi::CallbackInfo &info)
        : Napi::ObjectWrap<AbletonLink>(info)
        , link(120.0)
        {
            Napi::Env env = info.Env();
            Napi::HandleScope scope(env);

            int length = info.Length();

            if(0 < length && info[0].IsNumber()) {
                bpm = info[0].As<Napi::Number>().DoubleValue();
                const auto &&time = get_time();
                auto &&sessionState = get_session_state();
                sessionState->setTempo(bpm, time);
            } else {
                bpm = 120.0;
            }

            if(1 < length && info[1].IsNumber()) {
                quantum = info[1].As<Napi::Number>().DoubleValue();
            } else {
                quantum = 4.0;
            }

            if(2 < length && info[2].IsBoolean()) {
                bool enable = info[2].As<Napi::Boolean>();
                link.enable(enable);
            } else {
                link.enable(true);
            }

            static bool b{true};
            if(b) {
                callback_thread() = std::thread(callback_handler);
                b = false;
            }

            link.setTempoCallback([this](double bpm) {
                std::lock_guard<std::mutex> lock(bbb_mutex());
                bbb_tempo_queue().push({this, bpm});
            });
            link.setNumPeersCallback([this](std::size_t num) {
                std::lock_guard<std::mutex> lock(bbb_mutex());
                bbb_peers_queue().push({this, num});
            });
            link.setStartStopCallback([this](bool isPlaying) {
                std::lock_guard<std::mutex> lock(bbb_mutex());
                bbb_is_playing_queue().push({this, isPlaying});
            });
        }
        virtual ~AbletonLink() {
            tempoCallback = Napi::ThreadSafeFunction();
            numPeersCallback = Napi::ThreadSafeFunction();
            playStateCallback = Napi::ThreadSafeFunction();
        }
    private:
        static Napi::FunctionReference constructor;

#pragma mark about link state
        ToValue<Napi::Boolean> getLinkEnable(const Napi::CallbackInfo &info) // const
        { return toNapi(info, link.isEnabled()); }

        void setLinkEnable(const Napi::CallbackInfo &info) {
            bool enable = info[0].As<Napi::Boolean>();
            link.enable(enable);
        }
        void setLinkEnable_(const Napi::CallbackInfo &info, const Napi::Value &value) {
            bool enable = value.As<Napi::Boolean>();
            link.enable(enable);
        }
        void enable(const Napi::CallbackInfo &info)
        { link.enable(true); }

        void disable(const Napi::CallbackInfo &info)
        { link.enable(false); }
        
#pragma mark about play state sync
        ToValue<Napi::Boolean> getIsPlayStateSync(const Napi::CallbackInfo &info) // const
        { return toNapi(info, link.isStartStopSyncEnabled()); }

        void setIsPlayStateSync(const Napi::CallbackInfo &info) {
            bool enable = info[0].As<Napi::Boolean>();
            link.enableStartStopSync(enable);
        };
        void setIsPlayStateSync_(const Napi::CallbackInfo &info, const Napi::Value &value) {
            bool enable = value.As<Napi::Boolean>();
            link.enableStartStopSync(enable);
        };
        void enablePlayStateSync(const Napi::CallbackInfo &info)
        { link.enableStartStopSync(true); };

        void disablePlayStateSync(const Napi::CallbackInfo &info)
        { link.enableStartStopSync(false); };

#pragma mark about beat
        ToValue<Napi::Number> getBeat(const Napi::CallbackInfo &info) // const
        { return toNapi(info, beat); }

        void setBeat(const Napi::CallbackInfo &info) {
            double beat = info[0].As<Napi::Number>();
            const auto time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->requestBeatAtTime(beat, time, quantum);
        }

        void setBeat_(const Napi::CallbackInfo &info, const Napi::Value &value) {
            double beat = value.As<Napi::Number>();
            const auto time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->requestBeatAtTime(beat, time, quantum);
        }

        void setBeatForce(const Napi::CallbackInfo &info) {
            double beat = info[0].As<Napi::Number>();
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->forceBeatAtTime(beat, time, quantum);
        }

        ToValue<Napi::Number> getPhase(const Napi::CallbackInfo &info) // const
        { return toNapi(info, phase); }
        
        ToValue<Napi::Number> getBpm(const Napi::CallbackInfo &info) // const
        { return toNapi(info, bpm); }

        ToValue<Napi::Boolean> getIsPlayingWhenUpdate(const Napi::CallbackInfo &info) // const
        { return toNapi(info, isPlayingWhenUpdate); }

        void setBpm(const Napi::CallbackInfo &info) {
            double bpm = info[0].As<Napi::Number>();
            this->bpm = bpm;
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->setTempo(bpm, time);
        }
        
        void setBpm_(const Napi::CallbackInfo &info, const Napi::Value &value) {
            double bpm = value.As<Napi::Number>();
            this->bpm = bpm;
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->setTempo(bpm, time);
        }

        ToValue<Napi::Boolean> getIsPlaying(const Napi::CallbackInfo &info) // const
        { return toNapi(info, link.captureAppSessionState().isPlaying()); };
        
        void setIsPlaying(const Napi::CallbackInfo &info) {
            bool isPlaying = info[0].As<Napi::Boolean>();
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->setIsPlaying(isPlaying, time);
        }

        void setIsPlaying_(const Napi::CallbackInfo &info, const Napi::Value &value) {
            bool isPlaying = value.As<Napi::Boolean>();
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->setIsPlaying(isPlaying, time);
        }

        ToValue<Napi::Boolean> getIsPlayingOnUpdate(const Napi::CallbackInfo &info) // const
        { return toNapi(info, isPlayingWhenUpdate); };
        
        void play(const Napi::CallbackInfo &info) {
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->setIsPlaying(true, time);
        }

        void stop(const Napi::CallbackInfo &info) {
            const auto &&time = get_time();
            auto &&sessionState = get_session_state();
            sessionState->setIsPlaying(false, time);
        }

        ToValue<Napi::Number> getNumPeers(const Napi::CallbackInfo &info) // const 
        { return toNapi(info, link.numPeers()); }
        
        void setQuantum(const Napi::CallbackInfo &info) {
            double quantum = info[0].As<Napi::Number>();
            this->quantum = quantum;
        }
        
        void setQuantum_(const Napi::CallbackInfo &info, const Napi::Value &value) {
            double quantum = value.As<Napi::Number>();
            this->quantum = quantum;
        }

        ToValue<Napi::Number> getQuantum(const Napi::CallbackInfo &info) // const
        { return toNapi(info, quantum); }
        
        void onTempoChanged(const Napi::CallbackInfo &info) {
            Napi::Function cb = info[0].As<Napi::Function>();
            // tempoCallback = Napi::Persistent(cb);
            std::lock_guard<std::mutex> sl(bbb_mutex());
            tempoCallback = Napi::ThreadSafeFunction::New(
                info.Env(), cb,
                "tempoCallback",
                0, 1, []( Napi::Env ) {});
            has_tempoCallback = true;
        }
        
        void onNumPeersChanged(const Napi::CallbackInfo &info) {
            Napi::Function cb = info[0].As<Napi::Function>();
            // numPeersCallback = Napi::Persistent(cb);
            std::lock_guard<std::mutex> sl(bbb_mutex());
            numPeersCallback = Napi::ThreadSafeFunction::New(
                info.Env(), cb,
                "numPeersCallback",
                0, 1, []( Napi::Env ) {});
            has_numPeersCallback = true;
        }
        
        void onPlayStateChanged(const Napi::CallbackInfo &info) {
            Napi::Function cb = info[0].As<Napi::Function>();
            // playStateCallback = Napi::Persistent(cb);
            std::lock_guard<std::mutex> sl(bbb_mutex());
            playStateCallback = Napi::ThreadSafeFunction::New(
                info.Env(), cb,
                "playStateCallback",
                0, 1, []( Napi::Env ) {});
            has_playStateCallback = true;
        }
        
        void on(const Napi::CallbackInfo &info) {
            std::string key = info[0].As<Napi::String>();
            Napi::Function cb = info[1].As<Napi::Function>();
            if(key == "tempo") {
                // tempoCallback = Napi::Persistent(cb);
                std::lock_guard<std::mutex> sl(bbb_mutex());
                tempoCallback = Napi::ThreadSafeFunction::New(
                    info.Env(), cb,
                    "tempoCallback",
                    0, 1, []( Napi::Env ) {});
                has_tempoCallback = true;
            } else if(key == "numPeers") {
                // numPeersCallback = Napi::Persistent(cb);
                std::lock_guard<std::mutex> sl(bbb_mutex());
                numPeersCallback = Napi::ThreadSafeFunction::New(
                    info.Env(), cb,
                    "numPeersCallback",
                    0, 1, []( Napi::Env ) {});
                has_numPeersCallback = true;
            } else if(key == "playState") {
                // playStateCallback = Napi::Persistent(cb);
                std::lock_guard<std::mutex> sl(bbb_mutex());
                playStateCallback = Napi::ThreadSafeFunction::New(
                    info.Env(), cb,
                    "playStateCallback",
                    0, 1, []( Napi::Env ) {});
                has_playStateCallback = true;
            }
         }

        void off(const Napi::CallbackInfo &info) {
            std::string key = info[0].As<Napi::String>();
            if(key == "tempo") {
                std::lock_guard<std::mutex> sl(bbb_mutex());
                has_tempoCallback = false;
                tempoCallback = Napi::ThreadSafeFunction();
            } else if(key == "numPeers") {
                std::lock_guard<std::mutex> sl(bbb_mutex());
                has_numPeersCallback = false;
                numPeersCallback = Napi::ThreadSafeFunction();
            } else if(key == "playState") {
                std::lock_guard<std::mutex> sl(bbb_mutex());
                has_playStateCallback = false;
                playStateCallback = Napi::ThreadSafeFunction();
            }
        }
        
        // Napi::FunctionReference tempoCallback;
        // Napi::FunctionReference numPeersCallback;
        // Napi::FunctionReference playStateCallback;
        bool has_tempoCallback{false};
        Napi::ThreadSafeFunction tempoCallback;
        bool has_numPeersCallback{false};
        Napi::ThreadSafeFunction numPeersCallback;
        bool has_playStateCallback{false};
        Napi::ThreadSafeFunction playStateCallback;

        void update(const Napi::CallbackInfo &info) {
            const auto &&time = link.clock().micros();
            // auto &&sessionState = link.captureAppSessionState();
            auto &&sessionState = get_session_state();
            
            beat = sessionState->beatAtTime(time, quantum);
            phase = sessionState->phaseAtTime(time, quantum);
            bpm = sessionState->tempo();
            isPlayingWhenUpdate = sessionState->isPlaying();
        };
    };
};

template <bool is_audio_thread>
Napi::FunctionReference napi::AbletonLink<is_audio_thread>::constructor;
