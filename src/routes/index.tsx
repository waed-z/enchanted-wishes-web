import { createFileRoute } from "@tanstack/react-router";
import { Heart, Moon, Music2, Pause, Sparkles, Sun, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { BirthdayButton } from "../components/BirthdayButton";
import { birthdayContent as content } from "../data/birthday-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `A Birthday Surprise for ${content.name}` },
      { name: "description", content: "A magical, heartfelt birthday surprise made for someone truly special." },
      { property: "og:title", content: `A Birthday Surprise for ${content.name}` },
      { property: "og:description", content: "A magical, heartfelt birthday surprise made for someone truly special." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BirthdayExperience,
});

const ornaments = ["♥", "✦", "·", "♡", "✧", "♥", "·", "✦", "♡", "✧", "♥", "·"];
const wallNotes = ["Remember this?", "This one makes me smile.", "Never forget this day ♥", "A tiny piece of forever."];

function FloatingAtmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      {ornaments.map((symbol, index) => (
        <span
          key={`${symbol}-${index}`}
          className={`atmosphere__particle atmosphere__particle--${(index % 6) + 1}`}
        >
          {symbol}
        </span>
      ))}
    </div>
  );
}

function PhotoPlaceholder({ index, label }: { index: number; label: string }) {
  return (
    <div className={`photo-placeholder photo-placeholder--${(index % 4) + 1}`}>
      <span className="photo-placeholder__flower" aria-hidden="true">✿</span>
      <span className="photo-placeholder__label">{label}</span>
      <span className="photo-placeholder__hint">your photo here</span>
    </div>
  );
}

function PhotoView({ index, caption }: { index: number; caption: string }) {
  const memory = content.memories[index];
  if (memory?.src) {
    return <img src={memory.src} alt={caption} />;
  }
  return <PhotoPlaceholder index={index} label={`Memory ${String(index + 1).padStart(2, "0")}`} />;
}

function Cake({ extinguished, onWish, interactive = true }: { extinguished: boolean; onWish: () => void; interactive?: boolean }) {
  return (
    <button
      type="button"
      className={`cake ${interactive ? "cake--interactive" : ""}`}
      onClick={onWish}
      aria-label={extinguished ? "Wish made" : "Blow out the birthday candles"}
      disabled={!interactive || extinguished}
    >
      <span className="cake__candles" aria-hidden="true">
        {[0, 1, 2].map((candle) => (
          <span className="cake__candle" key={candle}>
            <span className={`cake__flame ${extinguished ? "cake__flame--out" : ""}`} />
          </span>
        ))}
      </span>
      <span className="cake__top"><span className="cake__icing" /></span>
      <span className="cake__middle"><span>♡</span><span>♡</span><span>♡</span></span>
      <span className="cake__base" />
      <span className="cake__plate" />
    </button>
  );
}

function BirthdayExperience() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [night, setNight] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [wishMade, setWishMade] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14 },
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [opened]);

  useEffect(() => {
    if (!letterOpen && selectedPhoto === null) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && (setLetterOpen(false), setSelectedPhoto(null));
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [letterOpen, selectedPhoto]);

  const openSurprise = () => {
    setOpening(true);
    window.setTimeout(() => {
      setOpened(true);
      window.scrollTo({ top: 0 });
    }, 1100);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }
    try {
      await audio.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  };

  const makeSparkle = (event: ReactMouseEvent<HTMLElement>) => {
    const id = Date.now();
    setSparkles((current) => [...current.slice(-10), { id, x: event.clientX, y: event.clientY }]);
    window.setTimeout(() => setSparkles((current) => current.filter((item) => item.id !== id)), 750);
  };

  const replay = () => {
    setOpened(false);
    setOpening(false);
    setLetterOpen(false);
    setWishMade(false);
    setGiftOpen(false);
    setSelectedPhoto(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`birthday-world ${night ? "birthday-world--night" : ""}`} onClick={makeSparkle}>
      <audio ref={audioRef} src={content.musicSrc} loop preload="none" />
      <FloatingAtmosphere />
      {sparkles.map((sparkle) => (
        <span key={sparkle.id} className="click-sparkle" style={{ left: sparkle.x, top: sparkle.y }} aria-hidden="true">✦</span>
      ))}

      <div className="corner-controls">
        <button className="round-control" onClick={toggleMusic} aria-label={musicOn ? "Pause music" : "Play music"} title={musicOn ? "Pause music" : "Play music"}>
          {musicOn ? <Pause size={17} /> : <Music2 size={17} />}
          {musicOn && <span className="music-wave" />}
        </button>
        <button className="round-control" onClick={() => setNight((value) => !value)} aria-label={night ? "Dreamy pink mode" : "Midnight pink mode"} title={night ? "Dreamy pink mode" : "Midnight pink mode"}>
          {night ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {!opened ? (
        <section className={`opening ${opening ? "opening--leaving" : ""}`}>
          <div className="opening__halo" aria-hidden="true" />
          <div className="opening__content">
            <span className="eyebrow">A LITTLE SOMETHING, JUST FOR YOU</span>
            <div className="opening__heart"><Heart fill="currentColor" strokeWidth={1.25} /></div>
            <h1>{content.intro.title} <em>♥</em></h1>
            <p>{content.intro.subtitle}</p>
            <BirthdayButton onClick={openSurprise}>Open Your Surprise <span aria-hidden="true">💕</span></BirthdayButton>
          </div>
          <div className="scroll-whisper">made with love <span>↓</span></div>
        </section>
      ) : (
        <div className="experience experience--open">
          <section className="hero scene" id="beginning">
            <div className="hero__ribbon hero__ribbon--left" aria-hidden="true">୨୧</div>
            <div className="hero__ribbon hero__ribbon--right" aria-hidden="true">୨୧</div>
            <div className="hero__copy reveal">
              <span className="eyebrow">TODAY, THE WORLD CELEBRATES YOU</span>
              <h1><span>{content.hero.title},</span> {content.name}!</h1>
              <p>{content.hero.subtitle} <span aria-hidden="true">♥</span></p>
            </div>
            <div className="hero__cake reveal">
              <Cake extinguished={false} onWish={() => document.getElementById("wish")?.scrollIntoView({ behavior: "smooth" })} />
              <span className="hero__cake-note">tap the cake for a little magic</span>
            </div>
            <BirthdayButton variant="soft" onClick={() => document.getElementById("memories")?.scrollIntoView({ behavior: "smooth" })}>There’s More <Sparkles size={16} /></BirthdayButton>
            <div className="hero__scroll">SCROLL TO UNWRAP <span>⌄</span></div>
          </section>

          <section className="memory-section scene" id="memories">
            <div className="section-heading reveal">
              <span className="eyebrow">OUR LITTLE ARCHIVE</span>
              <h2>Moments worth <em>keeping</em></h2>
              <p>Some memories are too lovely to live only in our minds.</p>
            </div>
            <div className="scrapbook">
              {content.memories.map((memory, index) => (
                <button
                  type="button"
                  key={memory.caption}
                  className={`polaroid polaroid--${index + 1} reveal`}
                  onClick={() => setSelectedPhoto(index)}
                  aria-label={`Open ${memory.caption}`}
                >
                  <span className="polaroid__tape" aria-hidden="true" />
                  <span className="polaroid__image"><PhotoView index={index} caption={memory.caption} /></span>
                  <span className="polaroid__caption">{memory.caption} <b>♥</b></span>
                  <span className="polaroid__note">{memory.note}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="letter-section scene">
            <div className="letter-section__copy reveal">
              <span className="eyebrow">STRAIGHT FROM MY HEART</span>
              <h2>You have a <em>letter</em></h2>
              <p>There are a few things a little screen can’t say. So I wrote them down instead.</p>
            </div>
            <button className="envelope reveal" type="button" onClick={() => setLetterOpen(true)} aria-label="Open your birthday letter">
              <span className="envelope__back" />
              <span className="envelope__paper"><span>for you</span><Heart fill="currentColor" /></span>
              <span className="envelope__front" />
              <span className="envelope__flap" />
              <span className="envelope__seal">♥</span>
            </button>
            <p className="interaction-note">tap to open</p>
          </section>

          <section className="wish-section scene" id="wish">
            <div className="section-heading reveal">
              <span className="eyebrow">CLOSE YOUR EYES</span>
              <h2>Make a <em>wish...</em></h2>
              <p>{wishMade ? "And keep a little magic for tomorrow, too." : "Think of something beautiful, then tap the candles."}</p>
            </div>
            <div className={`wish-stage reveal ${wishMade ? "wish-stage--made" : ""}`}>
              <div className="wish-stage__stars" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div>
              <Cake extinguished={wishMade} onWish={() => setWishMade(true)} />
              {wishMade && <div className="wish-reveal">I hope every wish you make comes true. <span>♥</span></div>}
            </div>
          </section>

          <section className="gift-section scene">
            <div className="section-heading reveal">
              <span className="eyebrow">WAIT, ONE MORE THING</span>
              <h2>I have one more <em>surprise...</em></h2>
            </div>
            <button type="button" className={`gift reveal ${giftOpen ? "gift--open" : ""}`} onClick={() => setGiftOpen(true)} disabled={giftOpen} aria-label="Open your gift">
              <span className="gift__glow" />
              <span className="gift__lid"><span className="gift__bow">୨୧</span></span>
              <span className="gift__box"><span className="gift__ribbon" /></span>
              <span className="gift__message"><Sparkles /><strong>You deserve all the happiness in the world.</strong><Heart fill="currentColor" /></span>
            </button>
            {!giftOpen && <p className="interaction-note">tap the gift to unwrap it</p>}
          </section>

          <section className="love-section scene">
            <div className="section-heading reveal">
              <span className="eyebrow">A FEW OF A MILLION</span>
              <h2>Things I love <em>about you</em></h2>
            </div>
            <div className="love-grid">
              {content.loveNotes.map(([icon, title, text], index) => (
                <article className="love-card reveal" key={title} style={{ transitionDelay: `${index * 70}ms` }}>
                  <span className="love-card__icon">{icon}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="love-card__spark">✦</span>
                </article>
              ))}
            </div>
          </section>

          <section className="wall-section scene">
            <div className="section-heading reveal">
              <span className="eyebrow">PINNED TO MY HEART</span>
              <h2>Our memory <em>wall</em></h2>
            </div>
            <div className="memory-wall">
              {content.memories.map((memory, index) => (
                <button type="button" className={`wall-photo wall-photo--${index + 1} reveal`} key={`wall-${memory.caption}`} onClick={() => setSelectedPhoto(index)}>
                  <span className="wall-photo__pin" />
                  <span className="wall-photo__image"><PhotoView index={index} caption={memory.caption} /></span>
                  <span className="wall-photo__note">{wallNotes[index]}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="finale scene">
            <div className="finale__rain" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index}>♥</i>)}</div>
            <div className="finale__content reveal">
              <span className="eyebrow">AND MOST OF ALL...</span>
              <div className="finale__heart"><Heart fill="currentColor" /></div>
              <h2>Happy Birthday,<br /><em>{content.name}</em> <span>♥</span></h2>
              <p>{content.final.middle}</p>
              <div className="finale__rule"><i />✦<i /></div>
              <p className="finale__closing">{content.final.closing} <span>✨</span></p>
              <BirthdayButton onClick={replay}>Replay the Surprise <span>💕</span></BirthdayButton>
            </div>
          </section>
        </div>
      )}

      {selectedPhoto !== null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Memory photo" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)} aria-label="Close photo"><X /></button>
            <div className="photo-modal__image"><PhotoView index={selectedPhoto} caption={content.memories[selectedPhoto]?.caption ?? "Memory"} /></div>
            <p>{content.memories[selectedPhoto]?.caption}</p>
          </div>
        </div>
      )}

      {letterOpen && (
        <div className="modal-backdrop modal-backdrop--letter" role="dialog" aria-modal="true" aria-label="Birthday letter" onClick={() => setLetterOpen(false)}>
          <article className="letter-paper" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setLetterOpen(false)} aria-label="Close letter"><X /></button>
            <span className="letter-paper__date">on your birthday</span>
            <h2>My dearest {content.name},</h2>
            {content.letter.split("\n").map((line, index) => <p key={`${line}-${index}`}>{line || <br />}</p>)}
            <footer>with all my love, always <span>♥</span></footer>
          </article>
        </div>
      )}
    </main>
  );
}
