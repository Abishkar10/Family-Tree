// Family Tree Data Structure
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

let currentMode = "view"; // or 'edit'
const treeContainer = document.getElementById("treeContainer");
const toggleModeBtn = document.getElementById("toggleModeBtn");

function generateId() {
  return Math.floor(Math.random() * 1000000);
}

function createNodeView(member) {
  const li = document.createElement("li");
  li.classList.add("mb-2");

  const label = document.createElement("div");
  label.className =
    "flex items-center cursor-pointer select-none text-blue-700 font-semibold";

  const toggleIcon = document.createElement("span");
  toggleIcon.textContent = member.children.length > 0 ? "▼" : "•";
  toggleIcon.className = "mr-2 text-lg select-none";
  toggleIcon.style.userSelect = "none";

  label.appendChild(toggleIcon);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = member.name;
  label.appendChild(nameSpan);

  const img = document.createElement("img");
  img.className = "node-photo ml-3";
  img.alt = member.name;
  img.width = 40;
  img.height = 40;
  if (member.photo) img.src = member.photo;
  else img.src = "./assets/person.png";
  label.appendChild(img);

  li.appendChild(label);

  if (member.children.length > 0) {
    const ul = document.createElement("ul");
    ul.className = "pl-6 border-l-2 border-blue-300 ml-3";

    for (const child of member.children) {
      ul.appendChild(createNodeView(child));
    }
    li.appendChild(ul);

    label.onclick = () => {
      if (ul.style.display === "none") {
        ul.style.display = "";
        toggleIcon.textContent = "▼";
      } else {
        ul.style.display = "none";
        toggleIcon.textContent = "▶";
      }
    };
  }

  return li;
}

function createNodeEdit(member, parent) {
  const li = document.createElement("li");
  li.classList.add("mb-3");

  const container = document.createElement("div");
  container.className = "edit-node-container";

  const toggleIcon = document.createElement("span");
  toggleIcon.textContent = member.children.length > 0 ? "▼" : "•";
  toggleIcon.className = "toggle-icon";
  container.appendChild(toggleIcon);

  const childrenContainer = document.createElement("ul");
  childrenContainer.className = "pl-6 border-l-2 border-blue-300 ml-3";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = member.name;
  nameInput.placeholder = "Name";
  nameInput.className = "border rounded px-2 py-1 focus:outline-blue-400";

  nameInput.oninput = (e) => {
    member.name = e.target.value;
  };

  container.appendChild(nameInput);

  const photoImg = document.createElement("img");
  photoImg.className = "node-photo";
  photoImg.alt = member.name;
  if (member.photo) photoImg.src = member.photo;
  else photoImg.src = "./assets/person.png";
  container.appendChild(photoImg);

  const photoInput = document.createElement("input");
  photoInput.type = "file";
  photoInput.accept = "image/*";
  photoInput.className = "text-sm";

  photoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      member.photo = ev.target.result;
      photoImg.src = member.photo;
    };
    reader.readAsDataURL(file);
  };
  container.appendChild(photoInput);

  const addChildBtn = document.createElement("button");
  addChildBtn.textContent = "+ Child";
  addChildBtn.className =
    "ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600";
  addChildBtn.onclick = () => {
    const newNode = {
      id: generateId(),
      name: "New Member",
      photo: null,
      children: [],
    };
    member.children.push(newNode);
    renderTree();
  };
  container.appendChild(addChildBtn);

  if (parent) {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className =
      "ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600";
    removeBtn.onclick = () => {
      parent.children = parent.children.filter((c) => c.id !== member.id);
      renderTree();
    };
    container.appendChild(removeBtn);
  }

  li.appendChild(container);

  for (const child of member.children) {
    childrenContainer.appendChild(createNodeEdit(child, member));
  }
  li.appendChild(childrenContainer);

  toggleIcon.onclick = () => {
    if (childrenContainer.style.display === "none") {
      childrenContainer.style.display = "";
      toggleIcon.textContent = "▼";
    } else {
      childrenContainer.style.display = "none";
      toggleIcon.textContent = "▶";
    }
  };

  return li;
}

function renderTree() {
  treeContainer.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "list-none";

  if (currentMode === "view") {
    ul.appendChild(createNodeView(familyData));
    toggleModeBtn.textContent = "Switch to Edit Mode";
  } else {
    ul.appendChild(createNodeEdit(familyData, null));
    toggleModeBtn.textContent = "Switch to View Mode";
  }

  treeContainer.appendChild(ul);
}

toggleModeBtn.onclick = () => {
  currentMode = currentMode === "view" ? "edit" : "view";
  renderTree();
};

renderTree();
