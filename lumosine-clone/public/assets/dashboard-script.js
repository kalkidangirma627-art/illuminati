document.addEventListener('DOMContentLoaded', function () {
  var modeSwitch = document.querySelector('.mode-switch');

  modeSwitch.addEventListener('click', function () {                     document.documentElement.classList.toggle('dark');
    modeSwitch.classList.toggle('active');
  });
  
  var listView = document.querySelector('.list-view');
  var gridView = document.querySelector('.grid-view');
  var projectsList = document.querySelector('.project-boxes');
  
  listView.addEventListener('click', function () {
    gridView.classList.remove('active');
    listView.classList.add('active');
    projectsList.classList.remove('jsGridView');
    projectsList.classList.add('jsListView');
  });
  
  gridView.addEventListener('click', function () {
    gridView.classList.add('active');
    listView.classList.remove('active');
    projectsList.classList.remove('jsListView');
    projectsList.classList.add('jsGridView');
  });
  
  document.querySelector('.messages-btn').addEventListener('click', function () {
    document.querySelector('.messages-section').classList.add('show');
  });
  
  document.querySelector('.messages-close').addEventListener('click', function() {
    document.querySelector('.messages-section').classList.remove('show');
  });
});
// Custom Application Logic
const isMember = document.title.includes("Member");
const isAgent = document.title.includes("Agent");
const isAdmin = document.title.includes("Admin");

const currentUserId = isMember ? "member1" : (isAgent ? "agent1" : "admin1");

const STAGES = [
  { key: "documentLegitimacy", label: "Document Legitimacy", color: "#ff942e", bgColor: "#fee4cb" },
  { key: "identityVerification", label: "Identity Verification", color: "#4f3ff0", bgColor: "#e9e7fd" },
  { key: "biometricInfo", label: "Biometric Info Storage", color: "#096c86", bgColor: "#d5deff" },
  { key: "sendingDocuments", label: "Sending Documents to HQ", color: "#df3670", bgColor: "#ffd3e2" },
  { key: "paymentFinalized", label: "Payment Finalized", color: "#34c471", bgColor: "#c8f7dc" }
];

if (typeof MockDB !== "undefined") {
  MockDB.subscribe((data) => {
    if (isMember) {
      renderMemberTasks(data.tasks[currentUserId]);
      renderMemberMessages(MockDB.getMessages(currentUserId));
      updateMetrics(data, currentUserId);
    } else if (isAgent || isAdmin) {
      // Implement Agent rendering logic
    }
  });
}

function renderMemberTasks(tasks) {
  const container = document.getElementById("member-tasks-container");
  if (!container) return;
  if (!tasks) tasks = {};
  
  container.innerHTML = STAGES.map((stage, idx) => {
    const isCompleted = tasks[stage.key] === true;
    const progress = isCompleted ? 100 : 0;
    
    return `
    <div class="project-box-wrapper">
      <div class="project-box" style="background-color: ${stage.bgColor};">
        <div class="project-box-header">
          <span>Stage ${idx + 1}</span>
        </div>
        <div class="project-box-content-header">
          <p class="box-content-header" style="font-size: 16px;">${stage.label}</p>
          <p class="box-content-subheader">${isCompleted ? "Completed" : "Pending"}</p>
        </div>
        <div class="box-progress-wrapper">
          <p class="box-progress-header">Progress</p>
          <div class="box-progress-bar">
            <span class="box-progress" style="width: ${progress}%; background-color: ${stage.color}; transition: width 0.5s ease-in-out;"></span>
          </div>
          <p class="box-progress-percentage">${progress}%</p>
        </div>
      </div>
    </div>
    `;
  }).join("");
}

function renderMemberMessages(messages) {
  const container = document.getElementById("member-messages-container");
  if (!container) return;
  
  if (messages.length === 0) {
    container.innerHTML = "<p style=\"padding: 20px; text-align: center; color: var(--secondary-color);\">No new messages.</p>";
    return;
  }
  
  container.innerHTML = messages.map(msg => `
    <div class="message-box">
      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80" alt="profile image">
      <div class="message-content">
        <div class="message-header">
          <div class="name">${msg.senderName}</div>
        </div>
        <p class="message-line">${msg.text}</p>
        <p class="message-line time">${new Date(msg.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  `).join("");
}


// ----- Agent / Admin Logic -----
function updateMetrics(data, agentId) {
  const users = data.users.filter(u => u.role === "Member" && (isAdmin || u.agentId === agentId));
  let inProgress = 0, upcoming = 0, completed = 0;
  
  users.forEach(u => {
    const t = data.tasks[u.id] || {};
    const taskVals = Object.values(t);
    const count = taskVals.filter(v => v === true).length;
    
    if (count === 0) upcoming++;
    else if (count === 5) completed++;
    else inProgress++;
  });
  
  const statusNumbers = document.querySelectorAll(".status-number");
  if (statusNumbers.length >= 3) {
    statusNumbers[0].textContent = inProgress;
    statusNumbers[1].textContent = upcoming;
    statusNumbers[2].textContent = completed;
  }
}

function renderAgentMembers(data) {
  updateMetrics(data, currentUserId);
  
  const container = document.getElementById("agent-members-container");
  if (!container) return;
  
  if (selectedMemberId) {
    // Render detail view for selected member
    const member = data.users.find(u => u.id === selectedMemberId);
    const tasks = data.tasks[selectedMemberId] || {};
    
    container.innerHTML = `
      <div style="width: 100%; margin-bottom: 20px;">
        <button onclick="selectedMemberId = null; MockDB.subscribe(renderAgentMembers);" style="background: transparent; color: var(--main-color); border: 1px solid var(--main-color); padding: 5px 15px; border-radius: 20px; cursor: pointer;">&larr; Back to Members</button>
        <h2 style="color: var(--main-color); display: inline-block; margin-left: 20px;">Managing: ${member.name}</h2>
      </div>
      ` + STAGES.map((stage, idx) => {
        const isCompleted = tasks[stage.key] === true;
        
        return `
        <div class="project-box-wrapper" style="width: 33.3%; min-width: 300px;">
          <div class="project-box" style="background-color: ${stage.bgColor}; height: 100%;">
            <div class="project-box-header">
              <span>Stage ${idx + 1}</span>
            </div>
            <div class="project-box-content-header" style="margin-bottom: 20px;">
              <p class="box-content-header" style="font-size: 16px;">${stage.label}</p>
            </div>
            <div class="box-progress-wrapper" style="display: flex; align-items: center; justify-content: space-between;">
              <p class="box-progress-header" style="margin: 0; font-size: 16px;">Mark Complete</p>
              <input type="checkbox" 
                     ${isCompleted ? "checked" : ""} 
                     onchange="MockDB.updateTask(\`${selectedMemberId}\`, \`${stage.key}\`, this.checked)"
                     style="width: 24px; height: 24px; cursor: pointer;">
            </div>
          </div>
        </div>
        `;
      }).join("");
  } else {
    // Render list of members
    const members = data.users.filter(u => u.role === "Member" && (isAdmin || u.agentId === currentUserId));
    
    container.innerHTML = members.map(member => {
      const t = data.tasks[member.id] || {};
      const count = Object.values(t).filter(v => v === true).length;
      const progress = (count / 5) * 100;
      
      return `
      <div class="project-box-wrapper" style="cursor: pointer;" onclick="selectedMemberId = \`${member.id}\`; MockDB.subscribe(renderAgentMembers);">
        <div class="project-box">
          <div class="project-box-header">
            <span>Member</span>
          </div>
          <div class="project-box-content-header">
            <p class="box-content-header">${member.name}</p>
            <p class="box-content-subheader">ID: ${member.id.toUpperCase()}</p>
          </div>
          <div class="box-progress-wrapper">
            <p class="box-progress-header">Overall Progress</p>
            <div class="box-progress-bar">
              <span class="box-progress" style="width: ${progress}%; background-color: #4f3ff0"></span>
            </div>
            <p class="box-progress-percentage">${progress}%</p>
          </div>
        </div>
      </div>
      `;
    }).join("");
  }
  
  // Populate the message select dropdown
  const select = document.getElementById("agent-message-member-select");
  if (select) {
    const members = data.users.filter(u => u.role === "Member" && (isAdmin || u.agentId === currentUserId));
    const currentVal = select.value;
    select.innerHTML = members.map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    if (currentVal && members.find(m => m.id === currentVal)) {
      select.value = currentVal;
    }
  }
}

// Attach event listener for Agent Send Message
document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("agent-send-msg-btn");
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      const memberId = document.getElementById("agent-message-member-select").value;
      const textNode = document.getElementById("agent-message-text");
      if (memberId && textNode.value.trim()) {
        const agentName = isAgent ? "Agent" : "Admin";
        MockDB.addMessage(memberId, agentName, textNode.value.trim());
        textNode.value = "";
        alert("Message sent successfully to member!");
      }
    });
  }
});

