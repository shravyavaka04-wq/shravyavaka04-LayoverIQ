# LayoverIQ — DevOps Lifecycle & CI/CD Pipeline
> **"Smart decisions between flights."**

This document serves as the comprehensive guide for the **DevOps Lab Project**, demonstrating the end-to-end industry software delivery lifecycle for **LayoverIQ**.

---

## 1. End-to-End DevOps Pipeline Architecture

```
+------------------+      +-------------------+      +----------------------+
|  Collaborator 1  |      |   Collaborator 2  |      |    Collaborator 3    |
| (Frontend Dev)   |      |   (Backend Dev)   |      |   (DevOps Engineer)  |
| feature/frontend |      |  feature/backend  |      |    feature/devops    |
+--------+---------+      +---------+---------+      +----------+-----------+
         |                          |                           |
         +--------------------------+---------------------------+
                                    |
                                    v
                         +--------------------+
                         | Git & GitHub Repo  |
                         |   (Pull Request)   |
                         +----------+---------+
                                    |
                                    v
                         +--------------------+
                         |  Peer Code Review  |
                         |  & Branch Approval |
                         +----------+---------+
                                    |
                                    v
                         +--------------------+
                         | Merge into `main`  |
                         +----------+---------+
                                    |
                                    v [GitHub Webhook Trigger]
                         +--------------------+
                         |   Jenkins CI/CD    |
                         +----------+---------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
     [Stage 1: Checkout]     [Stage 2: Deps]       [Stage 3: Lint/Build]
            |                       |                       |
            v                       v                       v
     [Stage 4: Jest Tests]   [Stage 5: Gate]       [Stage 6: Deploy]
            |                       |                       |
            +-----------------------+-----------------------+
                                    |
                                    v
                         +--------------------+
                         | Live LayoverIQ App |
                         | (Container / Web)  |
                         +--------------------+
```

---

## 2. The 10-Phase DevOps Lifecycle

### Phase 1: Local Version Control (Git)
Developers work locally, tracking atomic changes using Git.
```bash
# Initialize and verify local repository
git init
git status
```

---

### Phase 2: Remote Collaboration (GitHub)
The project repository is hosted on GitHub under the repository name **LayoverIQ**. The `main` branch is protected and requires passing CI checks and peer reviews before merging.

---

### Phase 3: 3 Independent Feature Branches
To simulate an enterprise team structure, the 3 collaborators work independently on dedicated branches:

| Collaborator | Assigned Feature Branch | Responsibilities |
| :--- | :--- | :--- |
| **Collaborator 1** | `feature/frontend` | Landing page, responsive UI, timeline visualizer, Leaflet maps, "What If?" sliders, emergency modal. |
| **Collaborator 2** | `feature/backend` | Express REST API, Layover Calculator, Risk Scorer, Feasibility Engine, Database models & Jest test suites. |
| **Collaborator 3** | `feature/devops` | Jenkinsfile declarative pipeline, Dockerfile, docker-compose, CI automation, quality gates, and documentation. |

**Branch Creation Commands:**
```bash
# Collaborator 1
git checkout -b feature/frontend

# Collaborator 2
git checkout -b feature/backend

# Collaborator 3
git checkout -b feature/devops
```

---

### Phase 4: Pull Request (PR) Submission
Once a feature is completed and tested locally, the developer commits and pushes to GitHub, then opens a formal Pull Request:
```bash
git add .
git commit -m "feat(frontend): implement interactive timeline and risk meter"
git push origin feature/frontend
```
The developer targets: `base: main` $\leftarrow$ `compare: feature/frontend`.

---

### Phase 5: Peer Code Review
1. A peer collaborator inspects the pull request diff.
2. Reviewers verify:
   - Does the code adhere to flight-safety calculation integrity?
   - Are there unit tests covering new methods?
   - Are API secrets properly isolated in `.env`?
3. Reviewer approves the changes or leaves actionable comments.

---

### Phase 6: Merge to `main`
Upon receiving approval and ensuring zero merge conflicts, the Pull Request is merged into the `main` branch.

---

### Phase 7: Automated Jenkins CI Trigger
GitHub sends an automated webhook payload to Jenkins on `push` / `merge` events to `main`.

**Jenkins Webhook Configuration:**
- GitHub Repo $\to$ Settings $\to$ Webhooks $\to$ Add webhook
- Payload URL: `http://<JENKINS_SERVER_IP>:8080/github-webhook/`
- Content type: `application/json`
- Events: `Just the push event`

---

### Phase 8: Automated Build & Dependency Installation
Jenkins checks out the source code and executes:
```bash
npm ci
npm run lint
npm run build
```

---

### Phase 9: Automated Unit & Integration Testing
Jenkins executes all automated Jest test suites:
```bash
npm test -- --coverage
```
The pipeline validates:
- User Authentication & Profile Security
- Layover Calculator (Total Layover - Processing - Buffers = Net usable time)
- Multi-factor Risk Scoring Algorithm (🟢 $\ge 85$, 🟡 $60-84$, 🔴 $<60$)
- "Can I Actually Visit This?" Feasibility proof
- "What If?" perturbation recalculations
- "I'm Running Late" emergency stop-pruning
- Budget and Weather intelligence

**If any test fails, Jenkins immediately terminates the build and sends an alert.**

---

### Phase 10: Production / Staging Deployment
Upon passing all quality gates, Jenkins packages the application container and deploys the live service:
```bash
docker-compose up -d --build
```
The live **LayoverIQ** application is available at `http://localhost:5000`.

---

## 3. Jenkins Pipeline Configuration Reference

To set up the Jenkins Pipeline job:
1. Open Jenkins Dashboard $\to$ **New Item** $\to$ Select **Pipeline** $\to$ Name: `LayoverIQ-CI-Pipeline`.
2. Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
3. Under **Pipeline**, select **Pipeline script from SCM**:
   - SCM: `Git`
   - Repository URL: `https://github.com/<your-username>/LayoverIQ.git`
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
4. Click **Save** and trigger **Build Now**.
# Jenkins pipeline verified
