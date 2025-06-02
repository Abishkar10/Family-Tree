let familyData = {
  id: 1,
  name: "Grandparent",
  photo: null,
  children: [
    {
      id: 2,
      name: "Parent 1",
      photo: null,
      children: [
        { id: 4, name: "Child 1", photo: null, children: [] },
        { id: 5, name: "Child 2", photo: null, children: [] },
      ],
    },
    {
      id: 3,
      name: "Parent 2",
      photo: null,
      children: [],
    },
  ],
};

let currentMode = "view";
const treeContainer = document.getElementById("treeContainer");
const toggleModeBtn = document.getElementById("toggleModeBtn");
const exportBtn = document.getElementById("exportJson");
const importInput = document.getElementById("importJson");
const exportImportControls = document.getElementById("exportImportControls");

function generateId() {
  return Math.floor(Math.random() * 1000000);
}

function createNodeView(member, isRoot = false) {
  const li = document.createElement("li");
  li.classList.add("mb-2");

  const label = document.createElement("div");
  label.className = "node-label cursor-pointer text-blue-700 font-semibold";

  const toggleIcon = document.createElement("span");
  toggleIcon.textContent = member.children.length > 0 ? "▼" : "•";
  toggleIcon.className = "mr-2";
  toggleIcon.style.userSelect = "none";
  label.appendChild(toggleIcon);

  const img = document.createElement("img");
  img.src = member.photo || "assets/person.png";
  img.alt = member.name;
  img.className = "node-photo";
  label.appendChild(img);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = member.name;
  label.appendChild(nameSpan);

  li.appendChild(label);

  if (member.children.length > 0) {
    const ul = document.createElement("ul");
    ul.className = "pl-6 border-l-2 border-blue-300 ml-3";
    ul.style.display = isRoot ? "" : "none";

    for (const child of member.children) {
      ul.appendChild(createNodeView(child));
    }
    li.appendChild(ul);

    label.onclick = () => {
      ul.style.display = ul.style.display === "none" ? "" : "none";
      toggleIcon.textContent = ul.style.display === "none" ? "▶" : "▼";
    };
  }

  return li;
}

function createNodeEdit(member, parent) {
  const li = document.createElement("li");
  li.classList.add("mb-4");

  const container = document.createElement("div");
  container.className = "flex items-center flex-wrap gap-2";

  const toggleIcon = document.createElement("span");
  toggleIcon.textContent = member.children.length > 0 ? "▼" : "•";
  toggleIcon.className = "cursor-pointer select-none";
  container.appendChild(toggleIcon);

  const img = document.createElement("img");
  img.src = member.photo || "assets/person.png";
  img.alt = member.name;
  img.className = "node-photo";
  container.appendChild(img);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = member.name;
  nameInput.placeholder = "Name";
  nameInput.oninput = (e) => (member.name = e.target.value);
  container.appendChild(nameInput);

  const photoInput = document.createElement("input");
  photoInput.type = "file";
  photoInput.accept = "image/*";
  photoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      member.photo = ev.target.result;
      img.src = member.photo;
    };
    reader.readAsDataURL(file);
  };
  container.appendChild(photoInput);

  const addChildBtn = document.createElement("button");
  addChildBtn.textContent = "+ Child";
  addChildBtn.className = "btn bg-green-500 hover:bg-green-600";
  addChildBtn.onclick = () => {
    member.children.push({
      id: generateId(),
      name: "New Member",
      photo: null,
      children: [],
    });
    renderTree();
  };
  container.appendChild(addChildBtn);

  if (parent) {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "btn bg-red-500 hover:bg-red-600";
    removeBtn.onclick = () => {
      parent.children = parent.children.filter((c) => c.id !== member.id);
      renderTree();
    };
    container.appendChild(removeBtn);
  }

  li.appendChild(container);

  const childrenContainer = document.createElement("ul");
  childrenContainer.className = "pl-6 border-l-2 border-blue-300 ml-3";

  member.children.forEach((child, idx) => {
    const childLi = createNodeEdit(child, member);

    const moveUpBtn = document.createElement("button");
    moveUpBtn.textContent = "↑";
    moveUpBtn.className = "reorder-btn";
    moveUpBtn.onclick = () => {
      if (idx > 0) {
        [member.children[idx], member.children[idx - 1]] = [
          member.children[idx - 1],
          member.children[idx],
        ];
        renderTree();
      }
    };

    const moveDownBtn = document.createElement("button");
    moveDownBtn.textContent = "↓";
    moveDownBtn.className = "reorder-btn ml-1";
    moveDownBtn.onclick = () => {
      if (idx < member.children.length - 1) {
        [member.children[idx], member.children[idx + 1]] = [
          member.children[idx + 1],
          member.children[idx],
        ];
        renderTree();
      }
    };

    const controls = document.createElement("div");
    controls.className = "mb-1 ml-6";
    controls.appendChild(moveUpBtn);
    controls.appendChild(moveDownBtn);

    childrenContainer.appendChild(controls);
    childrenContainer.appendChild(childLi);
  });

  li.appendChild(childrenContainer);

  toggleIcon.onclick = () => {
    childrenContainer.style.display =
      childrenContainer.style.display === "none" ? "" : "none";
    toggleIcon.textContent =
      childrenContainer.style.display === "none" ? "▶" : "▼";
  };

  return li;
}

function renderTree() {
  treeContainer.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "list-none";

  if (currentMode === "view") {
    ul.appendChild(createNodeView(familyData, true));
    toggleModeBtn.textContent = "Switch to Edit Mode";
    exportImportControls.classList.remove("hidden");
  } else {
    ul.appendChild(createNodeEdit(familyData, null));
    toggleModeBtn.textContent = "Switch to View Mode";
    exportImportControls.classList.add("hidden");
  }

  treeContainer.appendChild(ul);
}

toggleModeBtn.onclick = () => {
  currentMode = currentMode === "view" ? "edit" : "view";
  renderTree();
};

exportBtn.onclick = () => {
  const dataStr = JSON.stringify(familyData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "family-tree.json";
  a.click();
};

importInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      familyData = JSON.parse(ev.target.result);
      renderTree();
    } catch (e) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
};

renderTree();
