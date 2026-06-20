import { C } from "./tokens";

export const COURSES = [
  { id: "alg", title: "Algebra I", emoji: "\u{1F4D0}", lessons: 18, progress: 62, mode: "visual", color: C.visual },
  { id: "bio", title: "Intro to Biology", emoji: "\u{1F9EC}", lessons: 22, progress: 31, mode: "text", color: C.text },
  { id: "hist", title: "World History", emoji: "\u{1F3DB}️", lessons: 15, progress: 78, mode: "audio", color: C.audio },
];

export const TOPICS = [
  { topic: "Linear Eq.", mastery: 88 },
  { topic: "Inequalities", mastery: 74 },
  { topic: "Functions", mastery: 61 },
  { topic: "Quadratics", mastery: 43 },
  { topic: "Polynomials", mastery: 52 },
  { topic: "Systems", mastery: 69 },
];

export const STUDENTS = [
  { id: 1, name: "Maya Chen",    email: "maya.c@school.edu",   mastery: 91, improve: +6, hint: 12, recovery: 84, focus: 7.4, accuracy: 89, mode: "visual", status: "thriving" },
  { id: 2, name: "Liam Patel",   email: "liam.p@school.edu",   mastery: 78, improve: +3, hint: 28, recovery: 71, focus: 5.1, accuracy: 76, mode: "audio",  status: "on-track" },
  { id: 3, name: "Sofia Reyes",  email: "sofia.r@school.edu",  mastery: 44, improve: -2, hint: 61, recovery: 38, focus: 8.9, accuracy: 51, mode: "text",   status: "needs-support" },
  { id: 4, name: "Noah Kim",     email: "noah.k@school.edu",   mastery: 69, improve: +4, hint: 22, recovery: 66, focus: 4.6, accuracy: 71, mode: "visual", status: "on-track" },
  { id: 5, name: "Ava Johnson",  email: "ava.j@school.edu",    mastery: 38, improve: +1, hint: 54, recovery: 41, focus: 6.2, accuracy: 47, mode: "audio",  status: "needs-support" },
  { id: 6, name: "Ethan Brooks", email: "ethan.b@school.edu",  mastery: 85, improve: +5, hint: 15, recovery: 80, focus: 6.8, accuracy: 84, mode: "text",   status: "thriving" },
];

export const CHATBOT_TREND = [
  { week: 1, mins: 42, students: 18 }, { week: 2, mins: 51, students: 20 },
  { week: 3, mins: 68, students: 19 }, { week: 4, mins: 73, students: 21 },
  { week: 5, mins: 61, students: 17 }, { week: 6, mins: 88, students: 22 },
  { week: 7, mins: 95, students: 23 }, { week: 8, mins: 84, students: 20 },
];

export const ACCURACY_TREND = [
  { week: "W1", acc: 58 }, { week: "W2", acc: 62 }, { week: "W3", acc: 60 },
  { week: "W4", acc: 67 }, { week: "W5", acc: 71 }, { week: "W6", acc: 74 },
  { week: "W7", acc: 73 }, { week: "W8", acc: 78 },
];

export const QUESTIONS = [
  { q: "Solve for x:  3x − 5 = 16", options: ["x = 5", "x = 7", "x = 11", "x = 3"], correct: 1,
    hint: "Add 5 to both sides first, then divide by 3." },
  { q: "What is the slope of  y = −2x + 4 ?", options: ["4", "−2", "2", "−4"], correct: 1,
    hint: "In y = mx + b, the slope is the number multiplied by x." },
];
