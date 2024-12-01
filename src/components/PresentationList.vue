
<template>
  <div class="presentation-list">
    <h1>Collaborative Presentations</h1>
    <div class="presentation-header">
      <input v-model="nickname" placeholder="Enter your nickname" type="text" />
      <button @click="createPresentation">Create Presentation</button>
    </div>

    <div
      v-for="presentation in presentations"
      :key="presentation._id"
      class="presentation-card"
    >
      <h3>{{ presentation.title }}</h3>
      <button @click="joinPresentation(presentation.id)">Join</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      presentations: [],
      nickname: "",
    };
  },
  methods: {
    async fetchPresentations() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/presentations"
        );
        this.presentations = response.data;
      } catch (error) {
        console.error("Error fetching presentations:", error);
      }
    },
    async createPresentation() {
      if (!this.nickname) {
        alert("Please enter a nickname.");
        return;
      }
      try {
        const title = prompt("Enter a presentation title:");
        const response = await axios.post(
          "http://localhost:5000/api/presentations/create",
          {
            title,
            creator: this.nickname,
          }
        );
        this.$router.push({
          name: "Workspace",
          params: { id: response.data._id, nickname: this.nickname },
        });
      } catch (error) {
        console.error("Error creating presentation:", error);
      }
    },
    async joinPresentation(presentationId) {
      if (!this.nickname) {
        alert("Please enter a nickname.");
        return;
      }
      try {
        const response = await axios.post(
          `http://localhost:5000/api/presentations/join/${presentationId}`,
          { nickname: this.nickname }
        );

        // Navigate to the workspace upon successful join
        this.$router.push({
          name: "Workspace",
          params: { id: presentationId, nickname: this.nickname },
        });
      } catch (error) {
        console.error("Error joining presentation:", error);

        // Provide user-friendly feedback
        if (error.response && error.response.status === 404) {
          alert("Presentation not found.");
        } else {
          alert("Failed to join the presentation. Please try again.");
        }
      }
    },
  },
  created() {
    this.fetchPresentations();
  },
};
</script>

<style scoped>
.presentation-list {
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 50px auto;
  background-color: #f7f7f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 30px;
  font-weight: bold;
}

.presentation-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Ensures button is on the right side */
  margin-bottom: 20px;
}

input[type="text"] {
  width: calc(100% - 150px);
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-right: 10px;
  transition: border-color 0.3s;
  background-color: #fff;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

input[type="text"]:focus {
  border-color: #3498db;
  outline: none;
}

button {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #3498db;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background-color: #2980b9;
  transform: scale(1.05);
}

button:active {
  background-color: #1e6a92;
}

.presentation-card {
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin: 15px 0;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.presentation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.presentation-card h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.presentation-card button {
  background-color: #2ecc71;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.3s;
}

.presentation-card button:hover {
  background-color: #27ae60;
  transform: scale(1.05);
}

.presentation-card button:active {
  background-color: #1e8449;
}

/* Add some breathing room at the bottom */
.presentation-list {
  margin-bottom: 50px;
}
</style>

