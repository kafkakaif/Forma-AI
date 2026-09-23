# Forma AI – AI-Augmented Dynamic Form Engine

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-LangChain-orange" />
  <img src="https://img.shields.io/badge/WebApp-React-blueviolet?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?logo=github" />
</p>

<p align="center">
  <i>"Turning complex forms into intelligent, conversational workflows."</i>
</p>

---

## 📌 Overview

**Forma AI** is an AI-powered dynamic form engine designed to simplify complex and branching forms used in domains such as **Insurance, Healthcare, Finance, and Enterprise Workflow Automation**.

Instead of forcing users to manually complete dozens of form fields, Forma AI allows them to describe their situation using natural language.

The system uses an **LLM to extract structured information** from the user's description and automatically populates the corresponding fields in a dynamically generated React form.

---

## 💡 Example

A user enters:

> "I was driving my Honda Civic on Main Street yesterday when another car hit my rear bumper. The bumper is damaged and the rear lights are broken."

Forma AI processes the description and extracts:

```json
{
  "incidentType": "vehicle_collision",
  "vehicle": "Honda Civic",
  "location": "Main Street",
  "damage": [
    "rear_bumper",
    "rear_lights"
  ]
}