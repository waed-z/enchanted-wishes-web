import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, ImagePlus, Music2, Plus, RotateCcw, Save, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { BirthdayButton } from "../components/BirthdayButton";
import { EditorCard, Field } from "../components/EditorControl";
import {
  defaultPersonalization, fileToDataUrl, loadPersonalization, resetPersonalization, savePersonalization,
  themePresets, type BirthdayPersonalization, type DecorationKey,
} from "../lib/birthday-personalization";

export const Route = createFileRoute("/customize")({
  head: () => ({ meta: [
    { title: "Customize Birthday — Birthday Studio" },
    { name: "description", content: "Personalize every detail of your birthday surprise." },
    { property: "og:title", content: "Customize Birthday — Birthday Studio" },
    { property: "og:description", content: "Personalize every detail of your birthday surprise." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CustomizeBirthday,
});

type Tab = "basics" | "letters" | "photos" | "love" | "sections" | "style" | "music";
const tabs: Array<[Tab, string]> = [["basics","Basics"],["letters","Letters"],["photos","Photos & memories"],["love","Things I love"],["sections","Sections"],["style","Style"],["music","Music"]];
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random()*9999)}`;

function CustomizeBirthday() {
  const [draft, setDraft] = useState<BirthdayPersonalization>(structuredClone(defaultPersonalization));
  const [tab, setTab] = useState<Tab>("basics");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadPersonalization().then((value) => { setDraft(value); setReady(true); }); }, []);
  const update = (patch: Partial<BirthdayPersonalization>) => { setDraft((value) => ({ ...value, ...patch })); setSaved(false); };
  const showNotice = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2400); };
  const save = async () => { await savePersonalization(draft); setSaved(true); showNotice("Your birthday surprise is saved 💗"); };
  const reset = async () => { if (!window.confirm("Reset every customization and start again?")) return; await resetPersonalization(); setDraft(structuredClone(defaultPersonalization)); setSaved(true); showNotice("Customization reset"); };
  const move = <T,>(items: T[], index: number, direction: -1 | 1) => { const next = [...items]; const target=index+direction; if(target<0||target>=next.length)return items; [next[index],next[target]]=[next[target] as T,next[index] as T]; return next; };

  const uploadPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => ["image/jpeg","image/png","image/webp"].includes(file.type));
    const added = await Promise.all(files.map(async (file) => ({ id: uid("photo"), src: await fileToDataUrl(file), caption: file.name.replace(/\.[^.]+$/, ""), note: "A beautiful memory", date: "", style: "polaroid" as const })));
    update({ photos: [...draft.photos.filter((photo) => photo.src || !photo.caption.startsWith("One of my")), ...added] }); event.target.value="";
  };
  const uploadMusic = async (event: ChangeEvent<HTMLInputElement>) => { const file=event.target.files?.[0]; if(!file)return; update({ musicSrc: await fileToDataUrl(file), musicName: file.name }); };
  const preview = async () => { await savePersonalization(draft); setSaved(true); window.open("/?preview=1", "_blank", "noopener,noreferrer"); };

  if (!ready) return <main className="studio-loading"><Sparkles /> Preparing your birthday studio...</main>;
  return <main className="studio-shell">
    <header className="studio-topbar">
      <div className="studio-brand"><span>♥</span><div><b>Birthday Studio</b><small>{saved ? "All changes saved" : "Unsaved changes"}</small></div></div>
      <div className="studio-topbar__actions">
        <button className="studio-action studio-action--quiet" onClick={reset}><RotateCcw/> <span>Reset</span></button>
        <button className="studio-action" onClick={save}><Save/> <span>Save Changes</span></button>
        <button className="studio-action studio-action--primary" onClick={preview}><Eye/> <span>Preview Website</span></button>
      </div>
    </header>
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <div><span className="eyebrow">CUSTOMIZE BIRTHDAY</span><h1>Make it feel like <em>them.</em></h1><p>Every word, photo, and little detail can be yours.</p></div>
        <nav>{tabs.map(([id,label]) => <button key={id} className={tab===id?"is-active":""} onClick={()=>setTab(id)}>{label}</button>)}</nav>
        <Link to="/" className="studio-back"><ArrowLeft/> Birthday experience</Link>
      </aside>
      <section className="studio-editor">
        {tab === "basics" && <Panel title="The essentials" intro="Start with the words they’ll see first.">
          <div className="field-grid"><Field label="Birthday person’s name"><input value={draft.name} onChange={(e)=>update({name:e.target.value})}/></Field><Field label="Nickname (optional)"><input value={draft.nickname} onChange={(e)=>update({nickname:e.target.value})}/></Field></div>
          <Field label="Opening message"><input value={draft.introTitle} onChange={(e)=>update({introTitle:e.target.value})}/></Field>
          <Field label="Opening subtitle"><input value={draft.introSubtitle} onChange={(e)=>update({introSubtitle:e.target.value})}/></Field>
          <Field label="Birthday message"><textarea rows={3} value={draft.birthdayMessage} onChange={(e)=>update({birthdayMessage:e.target.value})}/></Field>
          <Field label="Gift reveal message"><textarea rows={3} value={draft.giftMessage} onChange={(e)=>update({giftMessage:e.target.value})}/></Field>
          <Field label="Final message"><input value={draft.finalMiddle} onChange={(e)=>update({finalMiddle:e.target.value})}/></Field>
          <Field label="Final closing"><textarea rows={3} value={draft.finalClosing} onChange={(e)=>update({finalClosing:e.target.value})}/></Field>
        </Panel>}

        {tab === "letters" && <Panel title="Letters from the heart" intro="Create as many envelopes as you want. Each one opens into its own keepsake.">
          <div className="editor-list">{draft.letters.map((letter,index)=><EditorCard key={letter.id} title={letter.title || `Letter ${index+1}`} subtitle={`Letter ${index+1}`} onDelete={()=>update({letters:draft.letters.filter((item)=>item.id!==letter.id)})} onMoveUp={index?()=>update({letters:move(draft.letters,index,-1)}):undefined} onMoveDown={index<draft.letters.length-1?()=>update({letters:move(draft.letters,index,1)}):undefined}>
            <div className="field-grid"><Field label="Title"><input value={letter.title} onChange={(e)=>update({letters:draft.letters.map(item=>item.id===letter.id?{...item,title:e.target.value}:item)})}/></Field><Field label="Subtitle (optional)"><input value={letter.subtitle} onChange={(e)=>update({letters:draft.letters.map(item=>item.id===letter.id?{...item,subtitle:e.target.value}:item)})}/></Field></div>
            <Field label="Your letter"><textarea className="letter-textarea" rows={10} value={letter.text} onChange={(e)=>update({letters:draft.letters.map(item=>item.id===letter.id?{...item,text:e.target.value}:item)})}/></Field>
            <div className="field-grid"><Field label="Signature (optional)"><input value={letter.signature} onChange={(e)=>update({letters:draft.letters.map(item=>item.id===letter.id?{...item,signature:e.target.value}:item)})}/></Field><Field label="Decorations"><select value={letter.decoration} onChange={(e)=>update({letters:draft.letters.map(item=>item.id===letter.id?{...item,decoration:e.target.value}:item)})}><option value="hearts">Hearts</option><option value="sparkles">Sparkles</option><option value="flowers">Flowers</option><option value="stars">Stars</option></select></Field></div>
            <Field label="Optional photo"><select value={letter.photoId} onChange={(e)=>update({letters:draft.letters.map(item=>item.id===letter.id?{...item,photoId:e.target.value}:item)})}><option value="">No photo</option>{draft.photos.filter(p=>p.src).map(p=><option value={p.id} key={p.id}>{p.caption}</option>)}</select></Field>
          </EditorCard>)}</div>
          <AddButton label="Add another letter" onClick={()=>update({letters:[...draft.letters,{id:uid("letter"),title:"A new letter",subtitle:"",text:"Write from your heart...",signature:"with love",photoId:"",decoration:"hearts"}]})}/>
        </Panel>}

        {tab === "photos" && <Panel title="Photos & memories" intro="Upload JPG, PNG, or WEBP photos. They’ll appear throughout the experience.">
          <label className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhotos}/><ImagePlus/><strong>Add photos from your device</strong><span>Choose one or several memories</span></label>
          <div className="editor-list">{draft.photos.map((photo,index)=><EditorCard key={photo.id} title={photo.caption || `Memory ${index+1}`} onDelete={()=>update({photos:draft.photos.filter(item=>item.id!==photo.id),coverPhotoId:draft.coverPhotoId===photo.id?"":draft.coverPhotoId})} onMoveUp={index?()=>update({photos:move(draft.photos,index,-1)}):undefined} onMoveDown={index<draft.photos.length-1?()=>update({photos:move(draft.photos,index,1)}):undefined}>
            <div className="photo-editor-row">{photo.src?<img src={photo.src} alt=""/>:<div className="photo-editor-empty">No photo yet</div>}<div><Field label="Caption"><input value={photo.caption} onChange={(e)=>update({photos:draft.photos.map(item=>item.id===photo.id?{...item,caption:e.target.value}:item)})}/></Field><Field label="Memory description"><textarea rows={3} value={photo.note} onChange={(e)=>update({photos:draft.photos.map(item=>item.id===photo.id?{...item,note:e.target.value}:item)})}/></Field></div></div>
            <div className="field-grid"><Field label="Date (optional)"><input type="date" value={photo.date} onChange={(e)=>update({photos:draft.photos.map(item=>item.id===photo.id?{...item,date:e.target.value}:item)})}/></Field><Field label="Display style"><select value={photo.style} onChange={(e)=>update({photos:draft.photos.map(item=>item.id===photo.id?{...item,style:e.target.value as typeof photo.style}:item)})}><option value="polaroid">Polaroid</option><option value="rounded">Rounded</option><option value="soft">Soft frame</option></select></Field></div>
            <label className="cover-choice"><input type="radio" checked={draft.coverPhotoId===photo.id} onChange={()=>update({coverPhotoId:photo.id})}/> Use as cover photo</label>
          </EditorCard>)}</div>
          <AddButton label="Add a memory without a photo" onClick={()=>update({photos:[...draft.photos,{id:uid("photo"),src:"",caption:"A new memory",note:"Write what made this moment special...",date:"",style:"polaroid"}]})}/>
        </Panel>}

        {tab === "love" && <Panel title="Things I love about you" intro="Add as many reasons as your heart can hold.">
          <div className="editor-list">{draft.loveNotes.map((note,index)=><EditorCard key={note.id} title={note.title||`Reason ${index+1}`} onDelete={()=>update({loveNotes:draft.loveNotes.filter(item=>item.id!==note.id)})} onMoveUp={index?()=>update({loveNotes:move(draft.loveNotes,index,-1)}):undefined} onMoveDown={index<draft.loveNotes.length-1?()=>update({loveNotes:move(draft.loveNotes,index,1)}):undefined}>
            <div className="icon-field-grid"><Field label="Icon / emoji"><input value={note.icon} onChange={(e)=>update({loveNotes:draft.loveNotes.map(item=>item.id===note.id?{...item,icon:e.target.value}:item)})}/></Field><Field label="Title"><input value={note.title} onChange={(e)=>update({loveNotes:draft.loveNotes.map(item=>item.id===note.id?{...item,title:e.target.value}:item)})}/></Field></div>
            <Field label="Why it matters"><textarea rows={3} value={note.description} onChange={(e)=>update({loveNotes:draft.loveNotes.map(item=>item.id===note.id?{...item,description:e.target.value}:item)})}/></Field>
          </EditorCard>)}</div>
          <AddButton label="Add another reason" onClick={()=>update({loveNotes:[...draft.loveNotes,{id:uid("love"),icon:"💗",title:"Another little thing",description:"Because..."}]})}/>
        </Panel>}

        {tab === "sections" && <Panel title="Arrange the journey" intro="Choose what they’ll see and the order in which the surprise unfolds.">
          <div className="section-sorter">{draft.sections.map((section,index)=><EditorCard key={section.id} title={section.label} onMoveUp={index?()=>update({sections:move(draft.sections,index,-1)}):undefined} onMoveDown={index<draft.sections.length-1?()=>update({sections:move(draft.sections,index,1)}):undefined}>
            <label className="switch-row"><span>{section.enabled?"Visible in the birthday experience":"Hidden from the birthday experience"}</span><input type="checkbox" checked={section.enabled} onChange={(e)=>update({sections:draft.sections.map(item=>item.id===section.id?{...item,enabled:e.target.checked}:item)})}/></label>
          </EditorCard>)}</div>
        </Panel>}

        {tab === "style" && <Panel title="Set the mood" intro="Pick a palette, cover shape, and just the right amount of magic.">
          <h3 className="studio-subtitle">Theme presets</h3><div className="preset-grid">{themePresets.map(preset=><button key={preset.id} className={draft.theme===preset.id?"is-active":""} onClick={()=>update({theme:preset.id,primaryColor:preset.primary,softColor:preset.soft})}><i style={{background:`linear-gradient(135deg,${preset.primary},${preset.soft})`}}/><span>{preset.label}</span></button>)}</div>
          <div className="field-grid color-fields"><Field label="Main color"><input type="color" value={draft.primaryColor} onChange={(e)=>update({theme:"custom",primaryColor:e.target.value})}/></Field><Field label="Soft color"><input type="color" value={draft.softColor} onChange={(e)=>update({theme:"custom",softColor:e.target.value})}/></Field></div>
          <Field label="Cover photo frame"><select value={draft.coverStyle} onChange={(e)=>update({coverStyle:e.target.value as typeof draft.coverStyle})}><option value="circle">Circle</option><option value="rounded">Rounded rectangle</option><option value="polaroid">Polaroid</option><option value="heart">Heart-shaped</option><option value="glow">Soft glowing frame</option></select></Field>
          <h3 className="studio-subtitle">Decorations</h3><div className="toggle-grid">{(Object.keys(draft.decorations) as DecorationKey[]).map(key=><label className="switch-row" key={key}><span>{key[0]?.toUpperCase()}{key.slice(1)}</span><input type="checkbox" checked={draft.decorations[key]} onChange={(e)=>update({decorations:{...draft.decorations,[key]:e.target.checked}})}/></label>)}</div>
        </Panel>}

        {tab === "music" && <Panel title="Choose the soundtrack" intro="Music stays optional and only starts after the recipient taps play.">
          <label className="upload-zone"><input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" onChange={uploadMusic}/><Upload/><strong>Upload your song</strong><span>{draft.musicName || "MP3, WAV, OGG, or M4A"}</span></label>
          <Field label={`Volume · ${Math.round(draft.musicVolume*100)}%`}><input type="range" min="0" max="1" step="0.05" value={draft.musicVolume} onChange={(e)=>update({musicVolume:Number(e.target.value)})}/></Field>
          {draft.musicSrc && <audio className="studio-audio" src={draft.musicSrc} controls volume={draft.musicVolume}/>}<p className="studio-tip"><Music2/> Browsers require the recipient to tap the music button before playback begins.</p>
        </Panel>}
      </section>
      <aside className="studio-preview" ref={previewRef} style={{"--studio-primary":draft.primaryColor,"--studio-soft":draft.softColor} as React.CSSProperties}>
        <span className="studio-preview__label"><Eye/> LIVE PREVIEW</span>
        <div className={`mini-surprise mini-surprise--${draft.coverStyle}`}>
          <div className="mini-surprise__spark">✦</div>
          {draft.coverPhotoId && draft.photos.find(p=>p.id===draft.coverPhotoId)?.src ? <img src={draft.photos.find(p=>p.id===draft.coverPhotoId)?.src} alt="Cover preview"/> : <div className="mini-surprise__heart">♥</div>}
          <small>HAPPY BIRTHDAY</small><h2>{draft.nickname||draft.name}</h2><p>{draft.birthdayMessage}</p><span>made with love</span>
        </div>
        <button className="studio-full-preview" onClick={preview}><Sparkles/> Open full preview</button>
      </aside>
    </div>
    {notice && <div className="studio-toast">{notice}</div>}
  </main>;
}

function Panel({title,intro,children}:{title:string;intro:string;children:React.ReactNode}) { return <div className="studio-panel"><span className="eyebrow">BIRTHDAY DETAILS</span><h2>{title}</h2><p className="studio-panel__intro">{intro}</p>{children}<div className="studio-bottom-actions"><BirthdayButton onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Back to top</BirthdayButton></div></div>; }
function AddButton({label,onClick}:{label:string;onClick:()=>void}) { return <button className="studio-add" onClick={onClick}><Plus/> {label}</button>; }
