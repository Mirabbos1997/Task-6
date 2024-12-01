<template>
  <div class="workspace">
    <!-- Slide Panel -->
    <div class="slide-panel">
      <h3>Slides</h3>
      <div
        v-for="(slide, index) in slides"
        :key="index"
        :class="{ active: currentSlideIndex === index }"
        @click="switchSlide(index)"
        class="slide-item"
      >
        Slide {{ index + 1 }}
      </div>
      <button v-if="isCreator" @click="addSlide" class="add-slide-btn">
        Add Slide
      </button>
    </div>

    <!-- Slide Area -->
    <div class="slide-area">
      <button @click="togglePresentMode" class="present-btn">
        {{ isPresentMode ? "Exit Present Mode" : "Present" }}
      </button>
      <div v-if="isPresentMode" class="present-mode">
        <div v-html="renderMarkdown(currentSlide.content)"></div>
      </div>
      <div v-else>
        <div
          v-for="(block, index) in currentSlide.blocks"
          :key="index"
          class="text-block"
          :style="block.style"
          v-draggable
        >
          <!-- Text Block Editing -->
          <textarea
            v-if="block.type === 'text' && canEdit"
            v-model="block.content"
            @input="updateSlide"
          ></textarea>
          <!-- Display Markdown -->
          <div
            v-else-if="block.type === 'text'"
            v-html="renderMarkdown(block.content)"
          ></div>
          <!-- Image Block -->
          <img
            v-if="block.type === 'image'"
            :src="block.content"
            :style="block.style"
          />
          <!-- Erase Tool -->
          <button v-if="canEdit" @click="eraseElement(index)" class="erase-btn">
            Erase
          </button>
        </div>
        <button v-if="canEdit" @click="addTextBlock" class="add-block-btn">
          Add Text Block
        </button>
        <button v-if="canEdit" @click="addImage" class="add-block-btn">
          Add Image
        </button>
      </div>
    </div>

    <!-- User Panel -->
    <div class="user-panel">
      <h3>Users</h3>
      <div v-for="user in users" :key="user.nickname" class="user-item">
        <span>{{ user.nickname }} ({{ user.role }})</span>
        <button
          v-if="isCreator"
          @click="toggleRole(user)"
          class="toggle-role-btn"
        >
          {{ user.role === "Viewer" ? "Make Editor" : "Make Viewer" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import { marked } from "marked";
import { vDraggable } from "vue-draggable-next";

export default {
  directives: { draggable: vDraggable },
  data() {
    return {
      slides: [{ content: "", blocks: [] }], // Default slide structure
      currentSlideIndex: 0,
      users: [],
      socket: null,
      nickname: "",
      isPresentMode: false,
    };
  },
  computed: {
    currentSlide() {
      return this.slides[this.currentSlideIndex] || { blocks: [] };
    },
    isCreator() {
      return this.users.some(
        (user) => user.nickname === this.nickname && user.role === "Editor"
      );
    },
    canEdit() {
      return (
        this.isCreator ||
        this.users.some(
          (user) => user.nickname === this.nickname && user.role === "Editor"
        )
      );
    },
  },
  methods: {
    switchSlide(index) {
      this.currentSlideIndex = index;
    },
    addSlide() {
      const newSlide = { content: "", blocks: [] };
      this.slides.push(newSlide);
      this.updateSlide();
    },
    addTextBlock() {
      const newBlock = {
        type: "text",
        content: "New Text Block",
        style: {
          position: "absolute",
          top: "50px",
          left: "50px",
          width: "200px",
        },
      };
      this.currentSlide.blocks.push(newBlock);
      this.updateSlide();
    },
    addImage() {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            type: "image",
            content: e.target.result,
            style: {
              position: "absolute",
              top: "50px",
              left: "50px",
              width: "200px",
              height: "auto",
            },
          };
          this.currentSlide.blocks.push(newImage);
          this.updateSlide();
        };
        reader.readAsDataURL(file);
      });
      fileInput.click();
    },
    eraseElement(index) {
      this.currentSlide.blocks.splice(index, 1);
      this.updateSlide();
    },
    updateSlide() {
      this.socket.emit("edit-slide", {
        id: this.$route.params.id,
        slides: this.slides,
      });
    },
    toggleRole(user) {
      const newRole = user.role === "Viewer" ? "Editor" : "Viewer";
      user.role = newRole;
      this.socket.emit("update-users", {
        id: this.$route.params.id,
        users: this.users,
      });
    },
    renderMarkdown(content) {
      if (!content) return "";
      return marked(content);
    },
    togglePresentMode() {
      this.isPresentMode = !this.isPresentMode;
    },
  },
  mounted() {
    const { id, nickname } = this.$route.params;
    this.nickname = nickname;

    this.socket = io("http://localhost:5000");
    this.socket.emit("join-presentation", id);

    this.socket.on("update-slide", (data) => {
      this.slides = data.slides;
    });

    this.socket.on("update-users", (data) => {
      this.users = data.users;
    });
  },
};
</script>



<style scoped>
.workspace {
  display: flex;
  height: 100vh;
  background-color: #f9f9f9;
}

.slide-panel,
.user-panel {
  width: 20%;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  overflow-y: auto;
}

.slide-area {
  flex: 1;
  padding: 20px;
  position: relative;
  overflow-y: auto;
  background-color: #f4f4f4;
}

.slide-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
}

.slide-item.active {
  background-color: #3498db;
  color: #fff;
}

.add-slide-btn,
.add-block-btn,
.present-btn {
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.present-btn {
  margin-bottom: 20px;
}

.text-block {
  border: 1px dashed #ddd;
  background-color: #fff;
  padding: 10px;
  position: absolute;
  cursor: move;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.toggle-role-btn {
  padding: 5px 10px;
  background-color: #e67e22;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.present-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.present-btn {
  position: absolute;
  top: 20px;
  right: 20px;
}
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
</style>
