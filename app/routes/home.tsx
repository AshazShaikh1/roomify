import Navebar from "components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUp, Clock, Layers } from "lucide-react";
import { Button } from "components/ui/Button";
import Upload from "components/Upload";
import { useNavigate } from "react-router";
import { useState } from "react";
import { createProject } from "lib/puter.actions";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([])

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`

    const newItem = {
      id: newId,
      name: name,
      sourceImage: base64Image,
      renderedImage: undefined,
      timestamp: Date.now()
    }

    const saved = await createProject({ item: newItem, visibility: 'private' })

    if (!saved) {
      console.error("Failed to create project")
      return false
    }

    setProjects((prev) => [newItem, ...prev])

    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRendered: saved.renderedImage || null,
        name
      }
    })

    return true;
  }

  return (
    <div className="home">
      <Navebar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of throught with Romify</h1>

        <p className="subtitle">
          Roomify is a AI-first design envirnment that helps you visualize, and ship architectural projects faster that ever
        </p>

        <div className="actions">
          <a href="#upload" className="cta">Start Building <ArrowRight className="icon" /></a>
          <Button variant="outline" size="lg">Watch Demo</Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, formats 10MB</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work shared community projects, all in one place.</p>
            </div>
          </div>

          <div className="projects-grid">
            {projects?.map(({ id, name, renderedImage, sourceImage, timestamp }) => (
              <div key={id} className="project-card grup">
                <div className="preview">
                  <img src={renderedImage || sourceImage} alt={name || "Project"} />
                  <div className="badge">
                    <span>Community</span>
                  </div>
                </div>

                <div className="card-body">
                  <div>
                    <h3>{name || "Untitled Project"}</h3>
                    <div className="meta">
                      <Clock size={12} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>By Ashaz</span>
                    </div>
                  </div>

                  <div className="arrow">
                    <ArrowUp size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
