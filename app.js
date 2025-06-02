document.addEventListener("DOMContentLoaded", () => {
  // Default flat members data with parent_id
  let membersData = [
    { id: "_root1", parent_id: null, name: "John Doe", imageDataUrl: "" },
    { id: "_child1", parent_id: "_root1", name: "Anna Doe", imageDataUrl: "" },
    { id: "_child2", parent_id: "_root1", name: "James Doe", imageDataUrl: "" },
    {
      id: "_grandchild1",
      parent_id: "_child2",
      name: "Sophia Doe",
      imageDataUrl: "",
    },
  ];

  let isEditMode = false;

  const treeEl = document.getElementById("tree");
  const toggleEditBtn = document.getElementById("toggleEditBtn");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");
  const fileInput = document.getElementById("fileInput");

  toggleEditBtn.addEventListener("click", () => {
    isEditMode = !isEditMode;
    toggleEditBtn.textContent = isEditMode ? "View" : "Edit";
    renderTree();
  });

  importBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) {
          membersData = imported;
          isEditMode = false;
          toggleEditBtn.textContent = "Edit";
          renderTree();
        } else {
          alert("Invalid JSON structure.");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    fileInput.value = "";
  });

  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(membersData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "family_tree.json";
    a.click();

    URL.revokeObjectURL(url);
  });

  // Generate unique IDs for new members
  function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  // Build nested tree from flat list with parent_id
  function buildTree(flatList) {
    const idMap = {};
    flatList.forEach((m) => (idMap[m.id] = { ...m, children: [] }));

    const roots = [];
    flatList.forEach((m) => {
      if (m.parent_id === null) {
        roots.push(idMap[m.id]);
      } else {
        const parent = idMap[m.parent_id];
        if (parent) {
          parent.children.push(idMap[m.id]);
        }
      }
    });
    return roots;
  }

  // Get array of generations (each generation = array of members)
  function getGenerations(treeRoots) {
    const generations = [];

    function traverse(nodes, level = 0) {
      if (!generations[level]) generations[level] = [];
      nodes.forEach((node) => {
        generations[level].push(node);
        if (node.children.length > 0) {
          traverse(node.children, level + 1);
        }
      });
    }

    traverse(treeRoots);
    return generations;
  }

  // Create DOM element for a member node
  function createMemberNode(member) {
    const div = document.createElement("div");
    div.className = "member";

    // Image element with fallback
    const img = document.createElement("img");
    img.src = member.imageDataUrl || "assets/person.png";
    img.alt = member.name;
    img.onerror = () => {
      img.src = "assets/person.png";
    };

    if (isEditMode) {
      img.classList.add("editable");
      img.title = "Click to upload image";
      img.style.cursor = "pointer";

      img.addEventListener("click", () => {
        uploadImage(member);
      });
    }

    div.appendChild(img);

    // Name display, editable in edit mode
    const nameSpan = document.createElement("span");
    nameSpan.textContent = member.name;
    if (isEditMode) {
      nameSpan.contentEditable = "true";
      nameSpan.spellcheck = false;
      nameSpan.addEventListener("input", () => {
        member.name = nameSpan.textContent.trim() || "Unnamed";
      });
    }
    div.appendChild(nameSpan);

    // Edit mode buttons
    if (isEditMode) {
      const nodeButtons = document.createElement("div");
      nodeButtons.className = "node-buttons";

      // Add child button
      const addChildBtn = document.createElement("button");
      addChildBtn.textContent = "+ Child";
      addChildBtn.title = "Add Child";
      addChildBtn.addEventListener("click", () => {
        addChild(member.id);
      });
      nodeButtons.appendChild(addChildBtn);

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.title = "Delete Member";
      delBtn.addEventListener("click", () => {
        if (confirm(`Delete ${member.name} and all descendants?`)) {
          deleteMember(member.id);
        }
      });
      nodeButtons.appendChild(delBtn);

      div.appendChild(nodeButtons);
    }

    return div;
  }

  // Add a child to a parent
  function addChild(parentId) {
    const newMember = {
      id: generateId(),
      parent_id: parentId,
      name: "Unnamed",
      imageDataUrl: "",
    };
    membersData.push(newMember);
    renderTree();
  }

  // Delete member and all descendants
  function deleteMember(id) {
    function deleteRecursive(targetId) {
      const children = membersData.filter((m) => m.parent_id === targetId);
      children.forEach((child) => deleteRecursive(child.id));
      const index = membersData.findIndex((m) => m.id === targetId);
      if (index > -1) membersData.splice(index, 1);
    }
    deleteRecursive(id);
    renderTree();
  }

  // Upload image for member
  function uploadImage(member) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        member.imageDataUrl = e.target.result;
        renderTree();
      };
      reader.readAsDataURL(file);
    });

    input.click();
  }

  // Render the whole tree
  function renderTree() {
    treeEl.innerHTML = "";

    if (membersData.length === 0) {
      treeEl.textContent = isEditMode
        ? "No members. Add root member to start."
        : "No family tree data available.";
      return;
    }

    const treeRoots = buildTree(membersData);
    const generations = getGenerations(treeRoots);

    generations.forEach((gen) => {
      const genDiv = document.createElement("div");
      genDiv.className = "generation";

      gen.forEach((member) => {
        const memberNode = createMemberNode(member);
        genDiv.appendChild(memberNode);
      });

      treeEl.appendChild(genDiv);
    });
  }

  // Initial render
  renderTree();
});
