                            className: "text-gray-400 hover:text-purple-400 transition-colors duration-200",
                            children: "Поддержка"
                        })]
                    }), r.jsx("div", {
                        className: "flex items-center gap-4",
                        children: r.jsx("a", {
                            href: "https://mebelplace.com.kz",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "text-gray-400 hover:text-purple-400 transition-colors duration-200",
                            children: r.jsx("svg", {
                                className: "w-5 h-5",
                                fill: "currentColor",
                                viewBox: "0 0 24 24",
                                "aria-hidden": "true",
                                children: r.jsx("path", {
                                    fillRule: "evenodd",
                                    d: "M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z",
                                    clipRule: "evenodd"
                                })
                            })
                        })
                    })]
                }), r.jsx("div", {
                    className: "mt-4 pt-4 border-t border-white/5 text-center",
                    children: r.jsx("p", {
                        className: "text-xs text-gray-500",
                        children: "Платформа для поиска мастеров и размещения заказов в Казахстане"
                    })
                })]
            })
        })
    },
    Wx = () => {
        const {
            user: e,
            isMaster: t,
            isClient: s,
            isGuest: n
        } = me(), i = zs(), c = n ? [{
            label: "Главная",
            href: "/",
            icon: _u
        }, {
            label: "Заявка всем",
            href: "/orders/create",
            icon: On,
            highlight: !0
        }, {
            label: "Создать видеорекламу",
            href: "/create-video-ad",
            icon: Cs
        }] : t ? [{
            label: "Главная",
            href: "/",
            icon: _u
        }, {
            label: "Все заявки",
            href: "/orders",
            icon: Rx
        }, {
            label: "Создать видеорекламу",
            href: "/create-video-ad",
            icon: On,
            highlight: !0
        }, {
            label: "Мессенджер",
            href: "/chat",
            icon: ct
        }, {
            label: "Профиль",
            href: "/profile",
            icon: di
        }] : [{
            label: "Главная",
            href: "/",
            icon: _u
        }, {
            label: "Мои заявки",
            href: "/orders",
            icon: Rx
        }, {
            label: "Заявка всем",
            href: "/orders/create",
            icon: On,
            highlight: !0
        }, {
            label: "Мессенджер",
            href: "/chat",
            icon: ct
        }, {
            label: "Профиль",
            href: "/profile",
            icon: di
        }], u = h => {
            if (h.scrollToVideos) {
                const m = document.getElementById("videos-section");
                m && m.scrollIntoView({
                    behavior: "smooth"
                })
            }
        }, d = h => h === "/" ? i.pathname === "/" : i.pathname.startsWith(h);
        return r.jsx(C.nav, {
            initial: {
                y: 100,
                opacity: 0
            },
            animate: {
                y: 0,
                opacity: 1
            },
            transition: {
                duration: .3
            },
            className: "fixed bottom-0 left-0 right-0 z-30 safe-area-bottom w-full",
            children: r.jsxs("div", {
                className: "relative backdrop-blur-xl bg-gradient-to-t from-black/90 via-black/80 to-black/60 border-t border-white/10 w-full",
                children: [r.jsx("div", {
                    className: "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                }), r.jsx("div", {
                    className: "flex items-center justify-around px-1 sm:px-2 py-2 sm:py-3 max-w-screen-xl mx-auto w-full",
                    children: c.map((h, m) => {
                        const j = d(h.href),
                            w = h.icon;
                        return r.jsxs(hv, {
                            to: h.href,
                            onClick: () => u(h),
                            className: "relative flex flex-col items-center justify-center flex-1 group",
                            children: [r.jsx(C.div, {
                                whileTap: {
                                    scale: .9
                                },
                                className: "relative flex flex-col items-center justify-center min-w-[60px] min-h-[60px]",
                                children: h.highlight ? r.jsx(C.div, {
                                    animate: j ? {
                                        scale: [1, 1.05, 1]
                                    } : {},
                                    transition: {
                                        duration: .3
                                    },
                                    className: `
                        relative flex items-center justify-center
                        w-14 h-14 -mt-6 rounded-2xl
                        ${j?"bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50":"bg-gradient-to-br from-purple-600/80 to-pink-600/80 shadow-md shadow-purple-600/30"}
                        transition-all duration-300
                      `,
                                    children: r.jsx(w, {
                                        className: `w-6 h-6 ${j?"text-white":"text-white/90"}`,
                                        strokeWidth: j ? 2.5 : 2
                                    })
                                }) : r.jsxs(r.Fragment, {
                                    children: [r.jsxs("div", {
                                        className: `
                        relative flex items-center justify-center
                        w-12 h-12 rounded-xl
                        transition-all duration-200
                        ${j?"bg-white/20":"group-hover:bg-white/10"}
                      `,
                                        children: [j && r.jsx(C.div, {
                                            layoutId: "bottomNavIndicator",
                                            className: "absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30",
                                            transition: {
                                                type: "spring",
                                                bounce: .2,
                                                duration: .6
                                            }
                                        }), r.jsx(w, {
                                            className: `
                            relative z-10 w-6 h-6 transition-all duration-200
                            ${j?"text-white scale-110":"text-white/60 group-hover:text-white/80"}
                          `,
                                            strokeWidth: j ? 2.5 : 2
                                        })]
                                    }), r.jsx("span", {
                                        className: `
                        mt-1 text-[10px] font-medium transition-all duration-200
                        ${j?"text-white":"text-white/50 group-hover:text-white/70"}
                      `,
                                        children: h.label
                                    })]
                                })
                            }), h.highlight && j && r.jsx(C.div, {
                                className: "absolute w-14 h-14 -mt-6 rounded-2xl bg-purple-500/30",
                                animate: {
                                    scale: [1, 1.2, 1],
                                    opacity: [.5, 0, .5]
                                },
                                transition: {
                                    duration: 2,
                                    repeat: 1 / 0
                                }
                            })]
                        }, h.href + m)
                    })
                }), r.jsx("div", {
                    className: "h-safe-area-inset-bottom bg-black/90"
                })]
            })
        })
    },
    e3 = () => {
        const {
            user: e,
            isLoading: t
        } = me(), n = zs().pathname === "/";
        return t ? r.jsx("div", {
            className: "min-h-screen flex items-center justify-center",
            children: r.jsx(C.div, {
                animate: {
                    rotate: 360
                },
                transition: {
                    duration: 1,
                    repeat: 1 / 0,
                    ease: "linear"
                },
                className: "w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
            })
        }) : n && e ? r.jsxs("div", {
            className: "min-h-screen flex flex-col",
            children: [r.jsx("main", {
                className: "flex-1 overflow-hidden",
                children: r.jsx(xp, {})
            }), r.jsx(Wx, {})]
        }) : r.jsxs("div", {
            className: "min-h-screen flex flex-col w-full",
            children: [r.jsxs("div", {
                className: "flex-1 flex flex-col min-h-0 w-full",
                children: [r.jsx(Q5, {}), r.jsx("main", {
                    className: "flex-1 overflow-y-auto w-full px-1 sm:px-2 md:px-4 pb-20 sm:pb-24",
                    children: r.jsx(C.div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            duration: .3
                        },
                        className: "w-full",
                        children: r.jsx(xp, {})
                    })
                }), r.jsx(J5, {})]
            }), r.jsx(Wx, {})]
        })
    },
    Pe = ({
        children: e,
        requiredRole: t
    }) => {
        const {
            isAuthenticated: s,
            user: n,
            isLoading: i
        } = me();
        return i ? r.jsx("div", {
            className: "flex items-center justify-center min-h-screen",
            children: r.jsx("div", {
                className: "w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"
            })
        }) : s ? t && (n == null ? void 0 : n.role) !== t ? r.jsx(fr, {
            to: "/",
            replace: !0
        }) : r.jsx(r.Fragment, {
            children: e
        }) : r.jsx(fr, {
            to: "/login",
            replace: !0
        })
    },
    t3 = () => {
        const [e, t] = y.useState(!1);
        y.useEffect(() => {
            localStorage.getItem("hasSeenOnboarding") || t(!0)
        }, []);
        const s = () => {
            localStorage.setItem("hasSeenOnboarding", "true"), t(!1)
        };
        return r.jsx(Nt, {
            children: e && r.jsx("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/70 w-full h-full",
                children: r.jsxs(C.div, {
                    initial: {
                        opacity: 0,
                        scale: .95
                    },
                    animate: {
                        opacity: 1,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        scale: .95
                    },
                    className: "w-full max-w-md glass-card p-6 relative",
                    children: [r.jsx("button", {
                        onClick: s,
                        className: "absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors",
                        children: r.jsx(Ds, {
                            className: "w-5 h-5 text-white"
                        })
                    }), r.jsxs("div", {
                        className: "text-center",
                        children: [r.jsx("h2", {
                            className: "text-2xl font-bold gradient-text mb-4",
                            children: "Добро пожаловать в MebelPlace!"
                        }), r.jsx("p", {
                            className: "text-white/70 mb-6",
                            children: "Платформа для поиска мастеров и размещения заказов. Создавайте заявки, смотрите портфолио мастеров в видео и общайтесь в чате!"
                        }), r.jsx(Oa, {
                            onClick: s,
                            children: "Начать"
                        })]
                    })]
                })
            })
        })
    },
    Dt = kN(Ee),
    pt = {
        getChats: () => Dt.list(),
        getChat: e => Dt.get(e),
        createChat: e => Dt.create(e),
        createChatWithUser: e => Dt.createWithUser(e),
        getMessages: (e, t) => Dt.getMessages(e, t),
        sendMessage: (e, t, s = "text", n) => Dt.sendMessage(e, t, s, n),
        markAsRead: (e, t) => Dt.markAsRead(e, t),
        markChatAsRead: e => Dt.markChatAsRead(e),
        uploadFile: async (e, t) => {
            const s = new FormData;
            return s.append("file", t), Dt.uploadFile(e, s)
        },
        deleteChat: e => Dt.deleteChat(e),
        blockUser: (e, t) => Dt.blockUser(e, t),
        getSupportChat: () => Dt.getSupportChat(),
        sendSupportMessage: (e, t = "text") => Dt.sendSupportMessage(e, t)
    },
    s3 = ({
        video: e,
        className: t = ""
    }) => {
        const s = je(),
            {
                user: n,
                isClient: i
            } = me(),
            [a, o] = y.useState(!1);
        if (!i || !n || e.masterId === n.id) return null;
        const l = async () => {
            try {
                o(!0);
                const c = await pt.createChatWithUser(e.masterId),
                    u = `${e.title}`,
                    d = {
                        videoId: e.id,
                        videoTitle: e.title,
                        videoThumbnail: e.thumbnailUrl ? `https://mebelplace.com.kz${e.thumbnailUrl}` : null
                    };
                console.log("🔍 [OrderButton] Sending message with metadata:", d), await pt.sendMessage(c.id || c.chatId, u, "text", d), s(`/chat/${c.id||c.chatId}`)
            } catch (c) {
                console.error("Failed to create order chat:", c)
            } finally {
                o(!1)
            }
        };
        return r.jsxs(C.button, {
            whileHover: {
                scale: 1.05
            },
            whileTap: {
                scale: .95
            },
            onClick: c => {
                c.stopPropagation(), l()
            },
            disabled: a,
            className: `
        relative overflow-hidden
        px-6 py-4 sm:px-8 sm:py-5
        bg-gradient-to-r from-orange-500 to-pink-500
        text-white font-bold text-base sm:text-lg
        rounded-2xl shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-3
        ${t}
      `,
            children: [a ? r.jsxs(r.Fragment, {
                children: [r.jsx(n5, {
                    className: "w-5 h-5 sm:w-6 sm:h-6 animate-spin"
                }), r.jsx("span", {
                    children: "Создание чата..."
                })]
            }) : r.jsxs(r.Fragment, {
                children: [r.jsx(d5, {
                    className: "w-5 h-5 sm:w-6 sm:h-6"
                }), r.jsx("span", {
                    children: "ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ"
                }), r.jsx(La, {
                    className: "w-4 h-4 sm:w-5 sm:h-5 opacity-70"
                })]
            }), r.jsx(C.div, {
                className: "absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0",
                whileHover: {
                    opacity: 1
                },
                transition: {
                    duration: .3
                }
            })]
        })
    },
    n3 = ({
        videos: e,
        initialIndex: t = 0,
        onClose: s,
        onVideoChange: n
    }) => {
        const {
            user: i,
            isMaster: a,
            isClient: o
        } = me(), l = je(), [c, u] = y.useState(t), [d, h] = y.useState({}), [m, j] = y.useState({}), [w, x] = y.useState(!1), [v, g] = y.useState(!1), [f, p] = y.useState(!1), [b, S] = y.useState([]), [A, N] = y.useState(""), [_, R] = y.useState(!1), [P, H] = y.useState(null), [W, Y] = y.useState(""), Z = y.useRef(0), $ = y.useRef(0), K = y.useRef(null), te = y.useRef(null), I = bc(0), L = WC(I, {
            stiffness: 400,
            damping: 38
        }), B = hn(L, [-300, 0, 300], [.9, 1, .9]), X = hn(L, [-200, 0, 200], [.5, 1, .5]);
        y.useState(!1);
        const z = e[c],
            Mt = () => {
                c > 0 && (I.set(100), setTimeout(() => {
                    u(c - 1), n == null || n(e[c - 1]), I.set(0)
                }, 50))
            },
            vt = () => {
                c < e.length - 1 && (I.set(-100), setTimeout(() => {
                    u(c + 1), n == null || n(e[c + 1]), I.set(0)
                }, 50))
            },
            ls = (k, T) => {
                const M = T.offset.y,
                    O = T.velocity.y;
                M < -120 || O < -500 ? vt() : M > 120 || O > 500 ? Mt() : I.set(0)
            };
        y.useEffect(() => {
            f && z && ki()
        }, [f, z]), y.useEffect(() => {
            const k = T => {
                T.key === "Escape" && f && p(!1)
            };
            return f ? (document.addEventListener("keydown", k), document.body.classList.add("comments-modal-open")) : document.body.classList.remove("comments-modal-open"), () => {
                document.removeEventListener("keydown", k), document.body.classList.remove("comments-modal-open")
            }
        }, [f]), y.useEffect(() => {
            const k = T => {
                if (!f) switch (T.key) {
                    case "ArrowUp":
                        T.preventDefault(), Mt();
                        break;
                    case "ArrowDown":
                        T.preventDefault(), vt();
                        break;
                    case " ":
                        T.preventDefault(), te.current && (te.current.paused ? te.current.play() : te.current.pause());
                        break
                }
            };
            return document.addEventListener("keydown", k), () => {
                document.removeEventListener("keydown", k)
            }
        }, [f, c, e]), y.useEffect(() => {
            z && j(k => ({
                ...k,
                [z.id]: {
                    isLiked: z.isLiked || !1,
                    likesCount: z.likesCount || 0,
                    commentsCount: z.commentsCount || 0
                }
            }))
        }, [z == null ? void 0 : z.id, z == null ? void 0 : z.isLiked, z == null ? void 0 : z.likesCount, z == null ? void 0 : z.commentsCount]), y.useEffect(() => {
            (async () => {
                if (!(!z || !i)) try {
                    const T = await Re.getBookmarkedVideos(),
                        M = Array.isArray(T) && T.some(O => O.id === z.id);
                    x(M)
                } catch (T) {
                    console.error("Failed to check bookmark status:", T), x(!1)
                }
            })()
        }, [z, i]), y.useEffect(() => {
            const k = T => {
                if (T >= 0 && T < e.length && !d[T]) {
                    const M = e[T],
                        O = document.createElement("video");
                    O.src = M.videoUrl, O.preload = "auto", O.oncanplaythrough = () => {
                        h(V => ({
                            ...V,
                            [T]: !0
                        }))
                    }
                }
            };
            k(c + 1), k(c - 1)
        }, [c, e, d]);
        const st = k => {
                "touches" in k ? Z.current = k.touches[0].clientY : Z.current = k.clientY
            },
            St = k => {
                if ("touches" in k) {
                    const T = k.touches[0].clientY;
                    $.current = T - Z.current
                } else {
                    const T = k.clientY;
                    $.current = T - Z.current
                }
            },
            Kn = () => {
                $.current < -80 && c < e.length - 1 ? u(k => k + 1) : $.current > 80 && c > 0 && u(k => k - 1), $.current = 0
            },
            $s = async () => {
                if (!(!z || v || !i)) try {
                    g(!0);
                    const k = m[z.id] || {
                        isLiked: z.isLiked || !1,
                        likesCount: z.likesCount || 0
                    };
                    console.log("Current like state:", k.isLiked, "Count:", k.likesCount), k.isLiked ? (await Re.unlikeVideo(z.id), j(T => ({
                        ...T,
                        [z.id]: {
                            ...T[z.id],
                            isLiked: !1,
                            likesCount: Math.max(0, k.likesCount - 1)
                        }
                    })), console.log("Unliked video")) : (await Re.likeVideo(z.id), j(T => ({
                        ...T,
                        [z.id]: {
                            ...T[z.id],
                            isLiked: !0,
                            likesCount: k.likesCount + 1
                        }
                    })), console.log("Liked video"))
                } catch (k) {
                    console.error("Failed to toggle like:", k)
                } finally {
                    g(!1)
                }
            }, bs = async () => {
                if (!(!z || !i)) try {
                    g(!0), w ? (await Re.removeBookmark(z.id), x(!1)) : (await Re.addBookmark(z.id), x(!0))
                } catch (k) {
                    console.error("Failed to toggle bookmark:", k)
                } finally {
                    g(!1)
                }
            }, cs = async () => {
                if (z) try {
                    const k = {
                        title: z.title || "Видео от MebelPlace",
                        text: z.description || "Посмотрите это видео на MebelPlace",
                        url: `${window.location.origin}/video/${z.id}`
                    };
                    navigator.share && navigator.canShare && navigator.canShare(k) ? await navigator.share(k) : (await navigator.clipboard.writeText(k.url), window.alert && alert("Ссылка скопирована в буфер обмена!"))
                } catch (k) {
                    console.error("Failed to share:", k);
                    try {
                        await navigator.clipboard.writeText(`${window.location.origin}/video/${z.id}`), window.alert && alert("Ссылка скопирована в буфер обмена!")
                    } catch (T) {
                        console.error("Failed to copy to clipboard:", T)
                    }
                }
            }, ki = async () => {
                if (z) try {
                    const k = await Re.getComments(z.id);
                    S(k.comments || k || [])
                } catch (k) {
                    console.error("Failed to load comments:", k)
                }
            }, Rc = async k => {
                if (k.preventDefault(), !(!z || !A.trim())) {
                    console.log("📝 Submitting comment:", A.trim());
                    try {
                        R(!0);
                        const T = await Re.addComment(z.id, A.trim());
                        console.log("📝 Comment response:", T), console.log("📝 Adding comment to state:", T), S(M => {
                            const O = [T, ...M];
                            return console.log("📝 Updated comments:", O), O
                        }), j(M => {
                            var O;
                            return {
                                ...M,
                                [z.id]: {
                                    ...M[z.id],
                                    commentsCount: (((O = M[z.id]) == null ? void 0 : O.commentsCount) || z.commentsCount || 0) + 1
                                }
                            }
                        }), N("")
                    } catch (T) {
                        console.error("📝 Failed to add comment:", T)
                    } finally {
                        R(!1)
                    }
                }
            }, eo = async (k, T) => {
                if (k.preventDefault(), !(!z || !W.trim())) try {
                    R(!0);
                    const M = await Re.addComment(z.id, W.trim(), T);
                    S(O => O.map(V => V.id === T ? {
                        ...V,
                        replies: [...V.replies || [], M]
                    } : V)), Y(""), H(null)
                } catch (M) {
                    console.error("Failed to add reply:", M)
                } finally {
                    R(!1)
                }
            }, _i = async (k, T) => {
                try {
                    T ? await Re.unlikeComment(k) : await Re.likeComment(k), S(M => M.map(O => O.id === k ? {
                        ...O,
                        is_liked: !T,
                        likes: T ? O.likes - 1 : O.likes + 1
                    } : (O.replies && (O.replies = O.replies.map(V => V.id === k ? {
                        ...V,
                        is_liked: !T,
                        likes: T ? V.likes - 1 : V.likes + 1
                    } : V)), O)))
                } catch (M) {
                    console.error("Failed to like comment:", M)
                }
            }, to = k => {
                const T = new Date(k),
                    O = Math.floor((new Date().getTime() - T.getTime()) / 1e3);
                return O < 60 ? "только что" : O < 3600 ? `${Math.floor(O/60)}м назад` : O < 86400 ? `${Math.floor(O/3600)}ч назад` : O < 604800 ? `${Math.floor(O/86400)}д назад` : T.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short"
                })
            }, so = k => k >= 1e6 ? `${(k/1e6).toFixed(1)}M` : k >= 1e3 ? `${(k/1e3).toFixed(1)}K` : k.toString();
        if (!z) return null;
        const Si = m[z.id] || {
                isLiked: z.isLiked || !1,
                likesCount: Number(z.likesCount || 0) || 0,
                commentsCount: Number(z.commentsCount || 0) || 0
            },
            _r = !a || z.masterId === (i == null ? void 0 : i.id),
            E = z.masterId === (i == null ? void 0 : i.id);
        return r.jsxs("div", {
            ref: K,
            className: "fixed inset-0 bg-black z-30 overflow-hidden",
            style: {
                touchAction: "none",
                background: "black",
                width: "100vw",
                height: "100vh"
            },
            onTouchStart: st,
            onTouchMove: St,
            onTouchEnd: Kn,
            onMouseDown: st,
            onMouseMove: St,
            onMouseUp: Kn,
            children: [r.jsxs("div", {
                className: "absolute inset-0 w-full h-full overflow-hidden",
                children: [e.map((k, T) => {
                    const M = T - c;
                    return Math.abs(M) > 1 ? null : r.jsx(C.div, {
                        style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            y: M === 0 ? L : M === 1 ? `calc(100% + ${I.get()}px)` : `calc(-100% + ${I.get()}px)`,
                            scale: M === 0 ? B : .95,
                            opacity: M === 0 ? X : .7,
                            willChange: "transform, opacity",
                            zIndex: M === 0 ? 1 : 0
                        },
                        drag: M === 0 ? "y" : !1,
                        dragConstraints: {
                            top: 0,
                            bottom: 0
                        },
                        onDragEnd: ls,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 40
                        },
                        children: r.jsx("div", {
                            className: "tiktok-video-container",
                            children: r.jsx("video", {
                                ref: T === c ? te : null,
                                src: k.videoUrl,
                                poster: k.thumbnailUrl || k.videoUrl,
                                className: "w-full h-full object-cover object-center",
                                autoPlay: T === c,
                                loop: !0,
                                muted: !0,
                                playsInline: !0,
                                onLoadStart: () => {
                                    T === c && te.current && (te.current.currentTime = 0)
                                },
                                onLoadedData: () => {
                                    T === c && te.current && te.current.play()
                                }
                            })
                        })
                    }, k.id)
                }), r.jsxs(C.div, {
                    className: "absolute right-2 sm:right-4 bottom-32 sm:bottom-24 flex flex-col items-center space-y-4 z-20",
                    style: {
                        y: hn(L, [-300, 0, 300], [30, 0, -30]),
                        opacity: hn(L, [-300, 0, 300], [.7, 1, .7])
                    },
                    children: [r.jsxs(C.button, {
                        whileTap: {
                            scale: .8
                        },
                        onClick: k => {
                            k.stopPropagation(), $s()
                        },
                        disabled: !i || v,
                        className: "flex flex-col items-center space-y-1",
                        children: [r.jsx("div", {
                            className: `p-1.5 sm:p-2 rounded-full ${Si.isLiked?"bg-red-500":"bg-black/30 backdrop-blur-sm"}`,
                            children: r.jsx(Ln, {
                                className: `w-5 h-5 sm:w-7 sm:h-7 ${Si.isLiked?"text-white fill-white":"text-white"}`
                            })
                        }), r.jsx("span", {
                            className: "text-white text-xs font-semibold",
                            children: so(Si.likesCount)
                        })]
                    }), _r && r.jsxs(C.button, {
                        whileTap: {
                            scale: .8
                        },
                        onClick: k => {
                            k.stopPropagation(), p(!0)
                        },
                        className: "flex flex-col items-center space-y-1",
                        children: [r.jsx("div", {
                            className: "p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm",
                            children: r.jsx(ct, {
                                className: "w-5 h-5 sm:w-7 sm:h-7 text-white"
                            })
                        }), r.jsx("span", {
                            className: "text-white text-xs font-semibold",
                            children: so(Si.commentsCount || 0)
                        })]
                    }), i && r.jsx(C.button, {
                        whileTap: {
                            scale: .8
                        },
                        onClick: k => {
                            k.stopPropagation(), bs()
                        },
                        disabled: v,
                        className: "flex flex-col items-center space-y-1",
                        children: r.jsx("div", {
                            className: `p-1.5 sm:p-2 rounded-full ${w?"bg-yellow-500":"bg-black/30 backdrop-blur-sm"}`,
                            children: w ? r.jsx(GC, {
                                className: "w-5 h-5 sm:w-7 sm:h-7 text-white fill-white"
                            }) : r.jsx(Go, {
                                className: "w-5 h-5 sm:w-7 sm:h-7 text-white"
                            })
                        })
                    }), r.jsx(C.button, {
                        whileTap: {
                            scale: .8
                        },
                        onClick: k => {
                            k.stopPropagation(), cs()
                        },
                        className: "flex flex-col items-center space-y-1",
                        children: r.jsx("div", {
                            className: "p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm",
                            children: r.jsx(Q1, {
                                className: "w-5 h-5 sm:w-7 sm:h-7 text-white"
                            })
                        })
                    })]
                }), r.jsx("div", {
                    style: {
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "40%",
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
                        pointerEvents: "none",
                        zIndex: 5
                    }
                }), o && !E && r.jsx("div", {
                    className: "absolute left-4 right-4 bottom-24 sm:bottom-28 flex justify-center z-[60]",
                    children: r.jsx(s3, {
                        video: z,
                        className: "w-full max-w-md"
                    })
                }), r.jsx(C.div, {
                    className: "absolute left-0 right-0 bottom-0 p-3 sm:p-4 pb-16 sm:pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10",
                    style: {
                        y: hn(L, [-300, 0, 300], [20, 0, -20]),
                        opacity: hn(L, [-300, 0, 300], [.8, 1, .8]),
                        pointerEvents: "none"
                    },
                    children: r.jsxs("div", {
                        className: "w-full max-w-2xl",
                        children: [r.jsxs("div", {
                            className: "flex items-center space-x-2 mb-3",
                            style: {
                                pointerEvents: "auto"
                            },
                            children: [r.jsxs("button", {
                                onClick: k => {
                                    k.stopPropagation(), z.masterId && l(`/master/${z.masterId}`)
                                },
                                className: "text-white font-bold hover:underline",
                                children: ["@", z.masterName || "Master"]
                            }), r.jsx("span", {
                                className: "text-white/70 text-sm",
                                children: "•"
                            }), r.jsx("span", {
                                className: "text-white/70 text-sm",
                                children: new Date(z.createdAt).toLocaleDateString("ru-RU")
                            })]
                        }), r.jsx("h3", {
                            className: "text-white font-semibold text-base sm:text-lg mb-2 line-clamp-2",
                            children: z.title
                        }), z.description && r.jsx("p", {
                            className: "text-white/90 text-xs sm:text-sm mb-3 line-clamp-2",
                            children: z.description
                        }), z.tags && z.tags.length > 0 && r.jsx("div", {
                            className: "flex flex-wrap gap-2",
                            children: z.tags.slice(0, 3).map((k, T) => r.jsxs("span", {
                                className: "text-white font-semibold text-sm",
                                children: ["#", k]
                            }, T))
                        })]
                    })
                })]
            }), r.jsx(Nt, {
                children: f && r.jsxs(C.div, {
                    initial: {
                        y: "100%"
                    },
                    animate: {
                        y: 0
                    },
                    exit: {
                        y: "100%"
                    },
                    transition: {
                        type: "spring",
                        damping: 30,
                        stiffness: 300
                    },
                    drag: "y",
                    dragConstraints: {
                        top: 0,
                        bottom: 0
                    },
                    dragElastic: .2,
                    onDragEnd: (k, T) => {
                        (T.offset.y > 150 || T.velocity.y > 500) && p(!1)
                    },
                    className: "absolute inset-x-0 bottom-0 h-[50vh] bg-black/95 backdrop-blur-xl rounded-t-3xl flex flex-col z-[300] w-full",
                    children: [r.jsx("div", {
                        className: "flex justify-center py-2",
                        children: r.jsx("div", {
                            className: "w-12 h-1 bg-white/30 rounded-full"
                        })
                    }), r.jsx("div", {
                        className: "px-4 pb-2 border-b border-white/10",
                        children: r.jsxs("h3", {
                            className: "text-white font-bold text-center",
                            children: [b.length, " ", b.length === 1 ? "комментарий" : "комментариев"]
                        })
                    }), r.jsx("div", {
                        className: "flex-1 overflow-y-auto px-4 py-2 space-y-3",
                        style: {
                            height: "60%",
                            maxHeight: "60%"
                        },
                        children: b.length === 0 ? r.jsx("div", {
                            className: "flex items-center justify-center h-full",
                            children: r.jsxs("div", {
                                className: "text-center text-white/60 py-4",
                                children: [r.jsx(ct, {
                                    className: "w-8 h-8 mx-auto mb-2 opacity-50"
                                }), r.jsx("p", {
                                    className: "text-sm",
                                    children: "Пока нет комментариев"
                                }), r.jsx("p", {
                                    className: "text-xs mt-1",
                                    children: "Будьте первым!"
                                })]
                            })
                        }) : b.map(k => {
                            var T;
                            return r.jsx("div", {
                                className: "space-y-2",
                                children: r.jsxs("div", {
                                    className: "flex space-x-3",
                                    children: [r.jsx("div", {
                                        className: "w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                                        children: ((T = k.username) == null ? void 0 : T.charAt(0).toUpperCase()) || "U"
                                    }), r.jsxs("div", {
                                        className: "flex-1 min-w-0",
                                        children: [r.jsxs("div", {
                                            className: "flex items-center space-x-2 mb-1",
                                            children: [r.jsx("span", {
                                                className: "font-semibold text-white text-sm",
                                                children: k.username || "Пользователь"
                                            }), r.jsx("span", {
                                                className: "text-xs text-white/50",
                                                children: to(k.created_at)
                                            })]
                                        }), r.jsx("p", {
                                            className: "text-white/90 text-sm mb-2 break-words",
                                            children: k.content
                                        }), r.jsxs("div", {
                                            className: "flex items-center space-x-4",
                                            children: [r.jsxs(C.button, {
                                                whileTap: {
                                                    scale: .9
                                                },
                                                onClick: () => _i(k.id, k.is_liked),
                                                className: `flex items-center space-x-1 text-xs font-medium ${k.is_liked?"text-red-400":"text-white/60"}`,
                                                children: [r.jsx(Mx, {
                                                    className: `w-4 h-4 ${k.is_liked?"fill-current":""}`
                                                }), r.jsx("span", {
                                                    children: k.likes || 0
                                                })]
                                            }), _r && r.jsxs(C.button, {
                                                whileTap: {
                                                    scale: .9
                                                },
                                                onClick: () => H(P === k.id ? null : k.id),
                                                className: "flex items-center space-x-1 text-xs font-medium text-white/60",
                                                children: [r.jsx(c5, {
                                                    className: "w-4 h-4"
                                                }), r.jsx("span", {
                                                    children: "Ответить"
                                                })]
                                            })]
                                        }), r.jsx(Nt, {
                                            children: P === k.id && r.jsxs(C.form, {
                                                initial: {
                                                    opacity: 0,
                                                    height: 0
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    height: "auto"
                                                },
                                                exit: {
                                                    opacity: 0,
                                                    height: 0
                                                },
                                                onSubmit: M => eo(M, k.id),
                                                className: "mt-3 flex space-x-2",
                                                children: [r.jsx("input", {
                                                    type: "text",
                                                    value: W,
                                                    onChange: M => Y(M.target.value),
                                                    placeholder: "Добавить ответ...",
                                                    className: "flex-1 bg-white/10 text-white placeholder-white/50 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/30",
                                                    disabled: _,
                                                    autoFocus: !0
                                                }), r.jsx(C.button, {
                                                    type: "submit",
                                                    disabled: !W.trim() || _,
                                                    whileTap: {
                                                        scale: .9
                                                    },
                                                    className: "p-2 rounded-full bg-white text-black disabled:opacity-50",
                                                    children: r.jsx(qa, {
                                                        className: "w-4 h-4"
                                                    })
                                                })]
                                            })
                                        }), k.replies && k.replies.length > 0 && r.jsx("div", {
                                            className: "mt-3 space-y-3 pl-4 border-l-2 border-white/10",
                                            children: k.replies.map(M => {
                                                var O;
                                                return r.jsxs("div", {
                                                    className: "flex space-x-2",
                                                    children: [r.jsx("div", {
                                                        className: "w-7 h-7 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0",
                                                        children: ((O = M.username) == null ? void 0 : O.charAt(0).toUpperCase()) || "U"
                                                    }), r.jsxs("div", {
                                                        className: "flex-1 min-w-0",
                                                        children: [r.jsxs("div", {
                                                            className: "flex items-center space-x-2 mb-1",
                                                            children: [r.jsx("span", {
                                                                className: "font-semibold text-white text-xs",
                                                                children: M.username || "Пользователь"
                                                            }), r.jsx("span", {
                                                                className: "text-xs text-white/50",
                                                                children: to(M.created_at)
                                                            })]
                                                        }), r.jsx("p", {
                                                            className: "text-white/80 text-xs mb-1 break-words",
                                                            children: M.content
                                                        }), r.jsxs(C.button, {
                                                            whileTap: {
                                                                scale: .9
                                                            },
                                                            onClick: () => _i(M.id, M.is_liked),
                                                            className: `flex items-center space-x-1 text-xs ${M.is_liked?"text-red-400":"text-white/50"}`,
                                                            children: [r.jsx(Mx, {
                                                                className: `w-3 h-3 ${M.is_liked?"fill-current":""}`
                                                            }), r.jsx("span", {
                                                                children: M.likes || 0
                                                            })]
                                                        })]
                                                    })]
                                                }, M.id)
                                            })
                                        })]
                                    })]
                                })
                            }, k.id)
                        })
                    }), r.jsx("div", {
                        className: "px-4 py-2 border-t border-white/10 flex-shrink-0",
                        style: {
                            height: "40%",
                            minHeight: "100px"
                        },
                        children: _r ? r.jsxs("form", {
                            onSubmit: Rc,
                            className: "flex space-x-2",
                            children: [r.jsx("input", {
                                type: "text",
                                value: A,
                                onChange: k => N(k.target.value),
                                placeholder: "Добавить комментарий...",
                                className: "flex-1 bg-white/10 text-white placeholder-white/50 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/30",
                                disabled: _
                            }), r.jsx(C.button, {
                                type: "submit",
                                disabled: !A.trim() || _,
                                whileTap: {
                                    scale: .9
                                },
                                className: "relative z-[350] px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed",
                                children: _ ? "..." : "Отправить"
                            })]
                        }) : r.jsx("div", {
                            className: "text-center py-2 text-white/50 text-sm",
                            children: "Только автор видео может оставлять комментарии"
                        })
                    })]
                })
            })]
        })
    },
    Ga = ({
        videos: e,
        initialIndex: t = 0,
        onClose: s,
        onVideoChange: n,
        emptyMessage: i = "Пока нет видео",
        emptySubMessage: a = "Скоро здесь появятся новые видео!"
    }) => {
        const [o, l] = y.useState(t);
        return !e || e.length === 0 ? r.jsx("div", {
            className: "flex items-center justify-center min-h-[70vh]",
            children: r.jsxs("div", {
                className: "text-center max-w-md mx-auto px-4",
                children: [r.jsx(C.div, {
                    initial: {
                        scale: 0
                    },
                    animate: {
                        scale: 1
                    },
                    transition: {
                        delay: .2
                    },
                    className: "w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center",
                    children: r.jsx(Cs, {
                        className: "w-12 h-12 text-white"
                    })
                }), r.jsx(C.h2, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        delay: .3
                    },
                    className: "text-3xl font-bold mb-4 gradient-text",
                    children: i
                }), r.jsx(C.p, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        delay: .4
                    },
                    className: "text-lg text-white/70",
                    children: a
                })]
            })
        }) : o !== null ? r.jsx(n3, {
            videos: e,
            initialIndex: o,
            onClose: () => {
                l(null), s == null || s()
            },
            onVideoChange: c => {
                n == null || n(c)
            }
        }) : (y.useEffect(() => {
            e.length > 0 && o === null && l(0)
        }, [e]), null)
    },
    r3 = () => {
        const {
            user: e
        } = me(), [t, s] = y.useState([]), [n, i] = y.useState(!0), [a, o] = y.useState(null);
        y.useEffect(() => {
            l()
        }, []);
        const l = async () => {
            try {
                i(!0), o(null);
                const c = await Re.getVideos({
                    limit: 50,
                    role: "master",
                    excludeUserId: e == null ? void 0 : e.id
                });
                s(c.videos || [])
            } catch (c) {
                console.error("Failed to load videos:", c), o("Не удалось загрузить видео"), s([])
            } finally {
                i(!1)
            }
        };
        return n ? r.jsx("div", {
            className: "flex items-center justify-center min-h-[70vh]",
            children: r.jsx(C.div, {
                animate: {
                    rotate: 360
                },
                transition: {
                    duration: 1,
                    repeat: 1 / 0,
                    ease: "linear"
                },
                className: "w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
            })
        }) : a ? r.jsx("div", {
            className: "flex items-center justify-center min-h-[70vh]",
            children: r.jsxs("div", {
                className: "text-center w-full px-4",
                children: [r.jsx(C.div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    className: "text-xl text-red-400 mb-4",
                    children: a
                }), r.jsx(C.button, {
                    whileHover: {
                        scale: 1.05
                    },
                    whileTap: {
                        scale: .95
                    },
                    onClick: l,
                    className: "glass-button",
                    children: "Попробовать снова"
                })]
            })
        }) : r.jsx(Ga, {
            videos: t,
            initialIndex: 0,
            emptyMessage: "Нет видео других мастеров",
            emptySubMessage: "Станьте первым, кто поделится своими работами!",
            onVideoChange: c => {
                console.log("Viewing video:", c.id)
            }
        })
    },
    i3 = () => {
        me();
        const [e, t] = y.useState([]), [s, n] = y.useState(!0), [i, a] = y.useState(null);
        y.useEffect(() => {
            o()
        }, []);
        const o = async () => {
            try {
                n(!0), a(null);
                const l = await Re.getVideos({
                    limit: 50,
                    role: "master",
                    sort: "recommended"
                });
                t(l.videos || [])
            } catch (l) {
                console.error("Failed to load videos:", l), a("Не удалось загрузить видео"), t([])
            } finally {
                n(!1)
            }
        };
        return s ? r.jsx("div", {
            className: "flex items-center justify-center min-h-[70vh]",
            children: r.jsx(C.div, {
                animate: {
                    rotate: 360
                },
                transition: {
                    duration: 1,
                    repeat: 1 / 0,
                    ease: "linear"
                },
                className: "w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
            })
        }) : i ? r.jsx("div", {
            className: "flex items-center justify-center min-h-[70vh]",
            children: r.jsxs("div", {
                className: "text-center w-full px-4",
                children: [r.jsx(C.div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    className: "text-xl text-red-400 mb-4",
                    children: i
                }), r.jsx(C.button, {
                    whileHover: {
                        scale: 1.05
                    },
                    whileTap: {
                        scale: .95
                    },
                    onClick: o,
                    className: "glass-button",
                    children: "Попробовать снова"
                })]
            })
        }) : r.jsx(Ga, {
            videos: e,
            initialIndex: 0,
            emptyMessage: "Нет видео мастеров",
            emptySubMessage: "Скоро здесь появятся работы мастеров!",
            onVideoChange: l => {
                console.log("Viewing video:", l.id)
            }
        })
    },
    a3 = () => {
        je();
        const {
            user: e,
            isMaster: t,
            isClient: s
        } = me(), [n, i] = y.useState([]), [a, o] = y.useState(!0);
        y.useState(null);
        const [l, c] = y.useState(!1);
        if (nn(), e && t) return r.jsx(r3, {});
        if (e && s) return r.jsx(i3, {});
        y.useEffect(() => {
            u()
        }, []);
        const u = async () => {
            try {
                o(!0);
                const h = await Re.getVideos({
                    limit: 50
                });
                i(h.videos || [])
            } catch (h) {
                console.error("Failed to load videos:", h), i([])
            } finally {
                o(!1)
            }
        }, d = () => {
            u(), c(!1)
        };
        return a ? r.jsx("div", {
            className: "flex items-center justify-center min-h-[70vh]",
            children: r.jsx(C.div, {
                animate: {
                    rotate: 360
                },
                transition: {
                    duration: 1,
                    repeat: 1 / 0,
                    ease: "linear"
                },
                className: "w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
            })
        }) : r.jsxs(r.Fragment, {
            children: [r.jsx(Ga, {
                videos: n,
                emptyMessage: "Пока нет видео",
                emptySubMessage: "Зарегистрируйтесь, чтобы загрузить первое видео!"
            }), r.jsx(J1, {
                isOpen: l,
                onClose: () => c(!1),
                onSuccess: d
            })]
        })
    };

function ew(e) {
    var t, s, n = "";
    if (typeof e == "string" || typeof e == "number") n += e;
    else if (typeof e == "object")
        if (Array.isArray(e)) {
            var i = e.length;
            for (t = 0; t < i; t++) e[t] && (s = ew(e[t])) && (n && (n += " "), n += s)
        } else
            for (s in e) e[s] && (n && (n += " "), n += s);
    return n
}

function o3() {
    for (var e, t, s = 0, n = "", i = arguments.length; s < i; s++)(e = arguments[s]) && (t = ew(e)) && (n && (n += " "), n += t);
    return n
}
const Eo = {
        fadeIn: {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            transition: {
                duration: .4,
                ease: [.4, 0, .2, 1]
            }
        },
        slideUp: {
            initial: {
                opacity: 0,
                y: 20
            },
            animate: {
                opacity: 1,
                y: 0
            },
            transition: {
                duration: .3,
                ease: [.4, 0, .2, 1]
            }
        },
        slideDown: {
            initial: {
                opacity: 0,
                y: -20
            },
            animate: {
                opacity: 1,
                y: 0
            },
            transition: {
                duration: .3,
                ease: [.4, 0, .2, 1]
            }
        },
        slideLeft: {
            initial: {
                opacity: 0,
                x: 20
            },
            animate: {
                opacity: 1,
                x: 0
            },
            transition: {
                duration: .3,
                ease: [.4, 0, .2, 1]
            }
        },
        slideRight: {
            initial: {
                opacity: 0,
                x: -20
            },
            animate: {
                opacity: 1,
                x: 0
            },
            transition: {
                duration: .3,
                ease: [.4, 0, .2, 1]
            }
        },
        scaleIn: {
            initial: {
                opacity: 0,
                scale: .95
            },
            animate: {
                opacity: 1,
                scale: 1
            },
            transition: {
                duration: .2,
                ease: [.4, 0, .2, 1]
            }
        },
        bounceIn: {
            initial: {
                opacity: 0,
                scale: .3
            },
            animate: {
                opacity: 1,
                scale: 1
            },
            transition: {
                duration: .5,
                ease: [.68, -.55, .265, 1.55],
                times: [0, .5, .7, 1]
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                duration: .2,
                ease: [.4, 0, .2, 1]
            }
        },
        hoverLift: {
            y: -2,
            scale: 1.02,
            transition: {
                duration: .2,
                ease: [.4, 0, .2, 1]
            }
        },
        tap: {
            scale: .95,
            transition: {
                duration: .1,
                ease: [.4, 0, .2, 1]
            }
        },
        stagger: {
            animate: {
                transition: {
                    staggerChildren: .1
                }
            }
        },
        spin: {
            animate: {
                rotate: 360
            },
            transition: {
                duration: 1,
                repeat: 1 / 0,
                ease: "linear"
            }
        },
        pulse: {
            animate: {
                scale: [1, 1.05, 1],
                opacity: [1, .8, 1]
            },
            transition: {
                duration: 2,
                repeat: 1 / 0,
                ease: [.4, 0, .6, 1]
            }
        },
        modal: {
            initial: {
                opacity: 0,
                scale: .9,
                y: 20
            },
            animate: {
