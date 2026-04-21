const Router = require("express");
const router = new Router();
const UserController = require("./controller/user.controller");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .png, .jpg, .webp
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    allowedTypes.test(ext) &&
    (mime === "image/jpeg" || mime === "image/png" || mime === "image/webp")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpg, png, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
});
router.get("/user", UserController.getUsers);
router.get("/user/teacher", UserController.getTeacher);
router.get("/user/student", UserController.getStudent);
router.get("/group", UserController.getGroups);
router.get("/teacher/plan/:id", UserController.teacherPlans);
router.get("/plan/active", UserController.getPlanInstance);
router.get("/teacher/plan/data/:planId", UserController.planInstance);
router.get("/teacher/plan/topics/:planId", UserController.planTopics);
router.get("/payment", UserController.getPayment);
router.get("/attendance", UserController.getAttendance);
router.get("/lesson", UserController.getLessons);
router.get("/stars", UserController.getStars);
router.get(
  "/stars/unread-count/:studentId",
  UserController.getUnreadCoinNotificationCount,
);
router.get(
  "/homework/student/:studentId",
  UserController.getIndividualHomeworks,
);
router.get("/homework/group/:studentId", UserController.getGroupHomeworks);
router.get(
  "/homework/submitted/:studentId",
  UserController.getSubmittedHomeworks,
);
router.get("/homework/submission", UserController.getSubmittions);
router.get("/homework/detail/:homeworkId", UserController.getHomeworkDetail);
router.get("/teacher/homework/:teacherId", UserController.getTeacherHomeworks);
router.get("/subjects", UserController.getSubjects);
router.get("/levels", UserController.getLevels);
router.get("/products", UserController.getProducts);
router.get("/orders", UserController.getOrders);
router.get("/orders/selected/items", UserController.getOrdersItem);
router.post("/order/create", UserController.createOrder);
router.post(
  "/products/create",
  upload.single("image_url"),
  UserController.createProduct,
);
router.post(
  "/student/profile/update",
  upload.single("image"),
  UserController.updateStudentProfile,
);
router.post("/homework/submit", UserController.submitHomework);
router.post("/teacher/homework/:id/exercises", UserController.addExercises);
router.post(
  "/teacher/homework/:id/assign",
  UserController.assignHomeworkStudent,
);
router.post(
  "/teacher/homework/:groupId/assign/teacher",
  UserController.assignHomework,
);
router.post("/teacher/homework", UserController.createHomework);
router.post("/homework/coins/earned", UserController.transferHomeworkCoins);
router.post("/stars/mark-as-read", UserController.markCoinNotificationsAsRead);
router.post("/user/:id", UserController.getUsersById);
router.post("/star/post", UserController.createStar);
router.post("/register", UserController.createUser);
router.post("/user/teacher/page", UserController.createTeacher);
router.post("/user/student/page", UserController.createStudent);
router.post("/user/group/page", UserController.createGroup);
router.post("/teacher/plan", UserController.createPlan);
router.post("/teacher/topics/create", UserController.createTopic);
router.post("/teacher/plan/assign", UserController.createPlanInstance);
router.post("/user/group/pages", UserController.addStudent);
router.post("/login", UserController.loginUsers);
router.post("/admin", UserController.getAdmin);
router.post("/attendance", UserController.studentAttendance);
router.post("/date", UserController.updateDay);
router.post("/status", UserController.updateStatus);
router.post("/status/active", UserController.updateStatusChange);
router.post("/homework/create", UserController.createTheme);
router.put("/star/put", UserController.updateStar);
router.put("/user/:id", UserController.updateUser);
router.put("/teacher/:id", UserController.updateTeacher);
router.put("/user/group/:id", UserController.updateGroup);
router.put("/homework/update", UserController.updateHomework);
router.put("/teacher/topics/update/:id", UserController.updateTopic);
router.put("/orders/:id", UserController.updateOrderStatus);
router.put(
  "/products/:id",
  upload.single("image_url"),
  UserController.updateProducts,
);
router.delete("/user/group", UserController.deleteGroup);
router.delete("/user/student", UserController.deleteUser);
router.delete("/user/studentGroup", UserController.deleteStudent);
router.delete("/plan/instance/:id", UserController.deletePlanInstance);
router.delete("/products/:id", UserController.deleteProducts);

module.exports = router;
