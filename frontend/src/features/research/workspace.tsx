import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  ChevronRight,
  Compass,
  Files,
  Folder,
  FolderPlus,
  Menu,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
  RotateCcw,
  FlaskConical,
  Network,
  Clock,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import cover from "@/assets/research-cover.jpg";
import { suggestedQueries, type Source, type Section } from "./model";
import { hitToSource, paperToSource } from "./live";
import { renderAnswer } from "./answer-text";
import { askPapers, listPapers } from "@/lib/api";
import { useResearch } from "./state";
import { ResearchSelect } from "./controls";
import { SourceCard } from "./source-card";
import { SourceDetails } from "./source-details";
import { UploadPanel } from "./upload-panel";
const navigation = [
  { section: "discover", to: "/", label: "Discover", icon: Compass },
  { section: "library", to: "/library", label: "Library", icon: Files },
  { section: "collections", to: "/collections", label: "Collections", icon: Folder },
] as const;
export function Workspace({ section }: { section: Section }) {
  const {
    saved,
    query,
    setQuery,
    collectionNames,
    addCollection,
    assignments,
    pool,
    addToPool,
    papers,
    setPapers,
    answer,
    setAnswer,
    hits,
    setHits,
  } = useResearch();
  const [draft, setDraft] = useState(query);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [selected, setSelected] = useState<Source | null>(null);
  const [upload, setUpload] = useState(false);
  const [menu, setMenu] = useState(false);
  const [collection, setCollection] = useState("all");
  const [newCollection, setNewCollection] = useState(false);
  const [name, setName] = useState("");
  const [collectionError, setCollectionError] = useState("");
  const request = useRef(0);
  useEffect(() => {
    listPapers()
      .then((r) => setPapers(r.papers))
      .catch(() => undefined);
    return () => {
      request.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    addToPool(papers.map(paperToSource));
  }, [papers, addToPool]);
  async function search(text: string) {
    const q = text.trim();
    setDraft(text);
    if (!q) return;
    const id = ++request.current;
    setStatus("loading");
    try {
      const result = await askPapers(q);
      if (id !== request.current) return;
      const found = result.sources.map(hitToSource);
      addToPool(found);
      setHits(found);
      setAnswer({ query: q, text: result.answer, notice: result.notice });
      setQuery(q);
      setStatus("success");
    } catch (e) {
      if (id !== request.current) return;
      setErrorText(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }
  function reset() {
    request.current++;
    setDraft("");
    setQuery("");
    setAnswer(null);
    setHits([]);
    setStatus("idle");
  }
  const paperSources = papers.map(paperToSource);
  const savedSources = saved.map((id) => pool[id]).filter((s): s is Source => Boolean(s));
  const visible: Source[] =
    section === "discover"
      ? query
        ? hits
        : []
      : section === "library"
        ? paperSources
        : savedSources.filter(
            (s) => collection === "all" || (assignments[s.id] || "Reading list") === collection,
          );
  function emptyView() {
    const noPapers = papers.length === 0;
    const title =
      section === "collections"
        ? saved.length === 0
          ? "Your next great idea belongs here"
          : "Nothing in this collection yet"
        : noPapers
          ? "Add your documents to begin"
          : section === "library"
            ? "Your library is empty"
            : query
              ? "No matching passages"
              : "Ask your first question";
    const text =
      section === "collections"
        ? "Save a passage from Discover to start your reading list."
        : noPapers
          ? "Upload one or more PDFs. Once they are indexed, every answer points back to the page it came from."
          : query
            ? "Try rephrasing your question."
            : "Type a question above or pick a starter to search your papers.";
    return (
      <div className="empty-state">
        <Bookmark size={30} />
        <h3>{title}</h3>
        <p>{text}</p>
        {section === "collections" ? (
          <Button asChild>
            <Link to="/">
              Go to Discover
              <ArrowRight />
            </Link>
          </Button>
        ) : noPapers ? (
          <Button onClick={() => setUpload(true)}>
            <Upload size={16} />
            Add documents
          </Button>
        ) : query ? (
          <Button variant="outline" onClick={reset}>
            <RotateCcw />
            Clear search
          </Button>
        ) : null}
      </div>
    );
  }
  const sectionTitle =
    section === "discover"
      ? "Discover"
      : section === "library"
        ? "Your library"
        : "Your collections";
  function sidebar() {
    return (
      <>
        <Link to="/" className="brand" onClick={() => setMenu(false)}>
          <span className="brand-mark">
            <Sparkles size={23} />
          </span>
          lumen<span className="brand-dot">.</span>
        </Link>
        <div className="workspace-name">
          <span className="workspace-avatar">R</span>
          <span>
            Research workspace<small>Personal workspace</small>
          </span>
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map((n) => (
            <Button
              asChild
              variant="ghost"
              key={n.section}
              className={`nav-link ${section === n.section ? "active" : ""}`}
            >
              <Link
                to={n.to}
                onClick={() => setMenu(false)}
                aria-current={section === n.section ? "page" : undefined}
              >
                <n.icon size={19} />
                {n.label}
                {n.section === "collections" && saved.length > 0 && (
                  <span className="nav-count">{saved.length}</span>
                )}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="collection-heading">
          <span className="nav-label">COLLECTIONS</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Create collection"
            title="Create collection"
            onClick={() => {
              setNewCollection(true);
              setMenu(false);
            }}
          >
            <Plus size={16} />
          </Button>
        </div>
        {collectionNames.map((c, i) => (
          <Link
            key={c}
            to="/collections"
            className="collection-link"
            onClick={() => {
              setCollection(c);
              setMenu(false);
            }}
          >
            <span className={`collection-dot dot-${i % 3}`} />
            {c}
          </Link>
        ))}
        <div className="sidebar-bottom">
          <div className="session-note">
            <FlaskConical size={16} />
            <span>
              Your workspace<small>Papers stay in this session.</small>
            </span>
          </div>
          <div className="profile">
            <span className="profile-avatar">RK</span>
            <span>
              Researcher<small>Personal account</small>
            </span>
            <span className="online-dot" />
          </div>
        </div>
      </>
    );
  }
  return (
    <div className="app-layout">
      <aside className="desktop-sidebar">{sidebar()}</aside>
      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent placement="sidebar" className="mobile-sidebar">
          <DialogTitle className="sr-only">Workspace navigation</DialogTitle>
          <DialogDescription className="sr-only">Choose a research section</DialogDescription>
          {sidebar()}
        </DialogContent>
      </Dialog>
      <div className="workspace-page">
        <header className="topbar">
          <div className="breadcrumbs">
            <Button
              variant="ghost"
              size="icon"
              className="menu-button"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </Button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{sectionTitle}</strong>
          </div>
          <div className="topbar-actions">
            <span className="session-badge">
              <span />
              Session active
            </span>
            <Button variant="outline" onClick={() => setUpload(true)}>
              <Upload size={15} />
              <span>Add documents</span>
            </Button>
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> YOUR NEXT INSIGHT STARTS HERE
              </div>
              <h1>
                {section === "discover"
                  ? "A little curiosity. A lot of discovery."
                  : section === "library"
                    ? "Your research, in one place."
                    : "Make room for your next idea."}
              </h1>
              <p>
                {section === "discover"
                  ? "Explore ideas, connect evidence, and see the bigger picture."
                  : section === "library"
                    ? "Revisit sources and uncover the connections between them."
                    : "Keep the sources that matter, organized around your questions."}
              </p>
            </div>
          </div>
          {section === "discover" && (
            <>
          <form
            className="research-search"
            onSubmit={(e) => {
              e.preventDefault();
              search(draft);
            }}
          >
            <Search size={22} />
            <label htmlFor="research-query" className="sr-only">
              Research query
            </label>
            <input
              id="research-query"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question or explore a research topic…"
            />
            <Button type="submit" aria-label="Search research" className="search-submit">
              <ArrowRight size={20} />
            </Button>
          </form>
          <div className="suggestions">
            <span>Start with</span>
            {suggestedQueries.map((q) => (
              <Button key={q} variant="ghost" onClick={() => search(q)}>
                {q}
                <ArrowUpRight size={13} />
              </Button>
            ))}
          </div>
            </>
          )}
          <div className="content-grid">
            <section className="results-section" aria-label="Research results">
              <div className="results-heading">
                <h2>
                  {section === "collections"
                    ? "Saved sources"
                    : section === "library"
                      ? "Uploaded documents"
                      : query
                        ? "Matching passages"
                        : "Results"}
                  <span>{visible.length}</span>
                </h2>
                {section !== "collections" && (
                  <span className="results-subtitle">Passages ranked by relevance to your question</span>
                )}
                {section === "collections" && (
                  <Button variant="ghost" onClick={() => setNewCollection(true)}>
                    <FolderPlus size={16} />
                    New collection
                  </Button>
                )}
              </div>
              {section === "collections" && (
                <div className="collection-filters">
                  <ResearchSelect
                    label="Filter collection"
                    value={collection}
                    onChange={setCollection}
                    options={[
                      { value: "all", label: "All collections" },
                      ...collectionNames.map((c) => ({ value: c, label: c })),
                    ]}
                  />
                </div>
              )}
              <div aria-live="polite" aria-busy={status === "loading"}>
                {status === "loading" ? (
                  <div className="loading-results" role="status">
                    <span className="loading-label">
                      <Sparkles size={17} />
                      Exploring the evidence…
                    </span>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="source-skeleton">
                        <span />
                        <div>
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : status === "error" ? (
                  <div className="empty-state">
                    <FlaskConical size={30} />
                    <h3>Research paused for a moment</h3>
                    <p>{errorText}</p>
                    <Button onClick={() => search(draft)}>
                      <RotateCcw />
                      Try again
                    </Button>
                  </div>
                ) : (
                  <>
                    {section === "discover" && answer && answer.query === query && (
                      <section className="answer-section">
                        <div className="answer-heading">
                          <Sparkles size={18} />
                          <h3>Answer from your papers</h3>
                        </div>
                        {answer.text ? (
                          <p style={{ whiteSpace: "pre-wrap" }}>
                            {renderAnswer(answer.text, hits, setSelected)}
                          </p>
                        ) : (
                          <p>{answer.notice ?? "No written answer is available."}</p>
                        )}
                        <small>
                          Written from the passages below. Check important claims in the original
                          paper.
                        </small>
                      </section>
                    )}
                    {visible.length > 0 ? (
                      visible.map((s) => <SourceCard key={s.id} source={s} onOpen={setSelected} />)
                    ) : (
                      emptyView()
                    )}
                  </>
                )}
              </div>
              <div className="results-footer">
                <span>
                  <Check size={14} /> Answers use only passages from your uploaded papers
                </span>
              </div>
            </section>
            <aside className="discovery-aside">
              <div className="topic-feature">
                <img
                  src={cover}
                  alt="Mint-colored branching neural connections on a charcoal background"
                  width={1152}
                  height={576}
                />
                <div className="topic-caption">
                  <span className="feature-label">
                    <Sparkles size={13} /> IN FOCUS
                  </span>
                  <h3>
                    The science of
                    <br />
                    connecting ideas
                  </h3>
                  <p>
                    Where artificial intelligence
                    <br />
                    meets human discovery.
                  </p>
                  <Button variant="outline" onClick={() => setUpload(true)}>
                    Add your papers
                    <ArrowUpRight size={15} />
                  </Button>
                </div>
              </div>
              <section className="trending-section">
                <div className="aside-heading">
                  <Network size={17} />
                  <h3>Questions worth asking</h3>
                </div>
                {[
                  {
                    title: "Main contribution",
                    count: "Ask your papers",
                    query: "What is the main contribution of these papers?",
                    color: "mint",
                  },
                  {
                    title: "Methods used",
                    count: "Ask your papers",
                    query: "What methods and datasets do the authors use?",
                    color: "sky",
                  },
                  {
                    title: "Limitations",
                    count: "Ask your papers",
                    query: "What limitations or future work do the authors mention?",
                    color: "peach",
                  },
                ].map((t, i) => (
                  <Button
                    key={t.title}
                    variant="ghost"
                    className="topic-link"
                    onClick={() => search(t.query)}
                  >
                    <span className={`topic-number tone-${t.color}`}>0{i + 1}</span>
                    <span>
                      {t.title}
                      <small>{t.count}</small>
                    </span>
                    <ChevronRight size={15} />
                  </Button>
                ))}
              </section>
              <section className="research-note">
                <BookOpen size={20} />
                <h3>
                  Good research starts
                  <br />
                  with a better question.
                </h3>
                <p>Follow the evidence. Challenge the answer. Leave room for the unexpected.</p>
                <div>
                  <Clock size={13} /> A moment for curiosity
                </div>
              </section>
            </aside>
          </div>
          <footer className="page-footer">
            <span className="footer-brand">
              <Sparkles size={13} /> lumen
            </span>
            <span>Less searching. More understanding.</span>
            <span>AI for Research & Knowledge Discovery</span>
          </footer>
        </main>
      </div>
      <SourceDetails source={selected} onClose={() => setSelected(null)} />
      <UploadPanel open={upload} onClose={() => setUpload(false)} onUploaded={setPapers} />
      <Dialog open={newCollection} onOpenChange={setNewCollection}>
        <DialogContent>
          <DialogTitle>A home for your ideas</DialogTitle>
          <DialogDescription>Create a collection for this research session.</DialogDescription>
          <form
            className="collection-form"
            onSubmit={(e) => {
              e.preventDefault();
              const clean = name.trim();
              if (!clean) {
                setCollectionError("Enter a collection name.");
                return;
              }
              if (collectionNames.includes(clean)) {
                setCollectionError("A collection with that name already exists.");
                return;
              }
              addCollection(clean);
              setName("");
              setCollectionError("");
              setNewCollection(false);
            }}
          >
            <label htmlFor="collection-name">Collection name</label>
            <input
              id="collection-name"
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Climate research"
            />
            {collectionError && (
              <p role="alert" className="error-copy">
                {collectionError}
              </p>
            )}
            <Button type="submit">
              <FolderPlus />
              Create collection
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
