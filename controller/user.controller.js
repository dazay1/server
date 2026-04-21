const db = require("../db");
const { storeSessionToken } = require("./token");
const crypto = require("crypto");

function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString("hex"); // Generates a random token in hexadecimal format
}
class UserController {
  async createUser(req, res) {
    const { firstName, lastName, studentPhone, parentPhone } = req.body;
    try {
      const existingUser = await db.query(
        `SELECT * FROM user_request WHERE firstName = '${firstName}' AND lastName = '${lastName}'`,
      );
      
      if (existingUser[1].email === undefined) {
        const result = await db.query(
          `INSERT INTO user_request (firstName, lastName, studentPhone, parentPhone) VALUES('${firstName}', '${lastName}', '${studentPhone}', '${parentPhone}')`,
        );
        // In order to get user in the terminal
        const user = await db.query(
          `SELECT * FROM user_request WHERE firstName = '${firstName}' AND lastName = '${lastName}'`,
        );
        const users = user[0];
        res.json(users[0]);
        res.json({ message: "Ma'lumotlaringiz muvaffaqiyatli qo'shildi" });
      } else {
        res.json({ message: "Sizning ma'lumotlaringiz allaqachon ro'yxatdan o'tgan" });
      }
    } catch (error) {
      res.json({ message: "User already exists" });
      console.error(error);
    }
  }

  async getUsers(req, res) {
    const result = await db.query(
      `SELECT * FROM students WHERE role = 'student'`,
    );
    const users = result[0];
    return res.json(users);
  }
  async getPayment(req, res) {
    const result = await db.query(`SELECT * FROM payment`);
    const users = result[0];
    res.json(users);
  }
  async getTeacher(req, res) {
    const result = await db.query(
      `SELECT * FROM students WHERE role = 'teacher'`,
    );
    const users = result[0];
    res.json(users);
  }
  async getTeacherGroups(req, res) {
    const { firstName, lastName } = req.body;
    const result = await db.query(
      `SELECT name FROM class WHERE firstName = '${firstName}' AND lastName = '${lastName}'"`,
    );
    res.jsno(result);
  }
  async getStudent(req, res) {
    const result = await db.query(
      `SELECT * FROM students WHERE role = 'student'`,
    );
    const users = result[0];
    res.json(users);
  }
  async getGroups(req, res) {
    const result = await db.query(`SELECT * FROM students 
                                  INNER JOIN class 
                                  ON students.firstName = class.firstName 
                                  AND students.lastName = class.lastName;`);

    const users = result[0];
    res.json(users);
  }
  async getAttendance(req, res) {
    const result = await db.query(`SELECT * FROM attendance`);
    const users = result[0];
    res.json(users);
  }
  async getLessons(req, res) {
    const result = await db.query(`SELECT * FROM class`);
    const user = result[0];
    res.json(user);
  }
  async getSuggestions(req, res) {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }
    try {
      const [rows] = await db.query(
        "SELECT DISTINCT name FROM your_table WHERE name LIKE ? LIMIT 10",
        [`%${query}%`],
      );
      res.json(rows.map((row) => row.name));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getStars(req, res) {
    const result = await db.query(`SELECT * FROM lesson_stars`);
    const users = result[0];
    res.json(users);
  }
  async getUnreadCoinNotificationCount(req, res) {
    const { studentId } = req.params;

    const [rows] = await db.query(
      `SELECT COUNT(*) AS unreadCount
      FROM lesson_stars
      WHERE student_id = ? AND is_read = FALSE`,
      [studentId],
    );

    res.json({ unreadCount: rows[0].unreadCount });
  }
  async markCoinNotificationsAsRead(req, res) {
    const { studentId } = req.body;

    await db.query(
      `UPDATE lesson_stars
      SET is_read = 1, read_at = NOW()
      WHERE student_id = ? AND is_read = 0`,
      [studentId],
    );

    res.json({ success: true });
  }
  async getSubjects(req, res) {
    const result = await db.query(`SELECT * FROM subjects`);
    const users = result[0];
    res.json(users);
  }
  async getLevels(req, res) {
    const result = await db.query(`SELECT * FROM levels`);
    const users = result[0];
    res.json(users);
  }
  async getIndividualHomeworks(req, res) {
    const { studentId } = req.params;

    try {
      const [rows] = await db.query(
        `
      SELECT 
        id,
        title,
        description,
        deadline,
        coins_reward
      FROM homeworks
      WHERE student_id = ?
      ORDER BY deadline ASC
      `,
        [studentId],
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getGroupHomeworks(req, res) {
    const { studentId } = req.params;

    try {
      const [rows] = await db.query(
        `
      SELECT 
  h.id,
  h.title,
  h.description,
  h.deadline,
  h.coins_reward
FROM homeworks h
JOIN class sc ON sc.name = h.class_id
WHERE classId = ?
ORDER BY h.deadline ASC;
      `,
        [studentId],
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getSubmittedHomeworks(req, res) {
    const { studentId } = req.params;
    try {
      const [rows] = await db.query(
        `SELECT * FROM student_homework WHERE student_id = ?`,
        [studentId],
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getSubmittions(req, res) {
    try {
      const [rows] = await db.query(`SELECT * FROM student_homework`);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  async getHomeworkDetail(req, res) {
    try {
      const { homeworkId } = req.params;

      if (!homeworkId) {
        return res.status(400).json({ message: "Invalid homework ID" });
      }

      const [homework] = await db.query(
        `SELECT * FROM homeworks WHERE id = ?`,
        [homeworkId],
      );

      if (!homework.length) {
        return res.status(404).json({ message: "Homework not found" });
      }

      const [exercises] = await db.query(
        `
      SELECT 
        e.id,
        e.question,
        et.type_key,
        e.data,
        e.points
      FROM exercises e
      JOIN exercise_types et ON et.id = e.exercise_type_id
      WHERE e.homework_id = ?
      ORDER BY e.order_index
      `,
        [homeworkId],
      );

      // ✅ FIX: Parse JSON data safely
      const parsedExercises = exercises.map((ex) => {
        let parsedData = ex.data;

        if (typeof ex.data === "string") {
          try {
            parsedData = JSON.parse(ex.data);
          } catch (e) {
            console.error("JSON parse error for exercise:", ex.id);
            parsedData = {};
          }
        }

        return {
          ...ex,
          data: parsedData,
        };
      });

      return res.json({
        homework: homework[0],
        exercises: parsedExercises,
      });
    } catch (err) {
      console.error("SERVER ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getTeacherHomeworks(req, res) {
    const { teacherId } = req.params; // or from auth later

    if (!teacherId) {
      return res.status(400).json({ error: "teacher_id is required" });
    }

    try {
      const [rows] = await db.query(
        `
      SELECT h.id, h.title, h.description, h.deadline, h.is_published, h.coins_reward,
             l.name AS level_name, s.name AS subject_name
      FROM homeworks h
      JOIN levels l ON h.level_id = l.id
      JOIN subjects s ON h.subject_id = s.id
      WHERE h.given_by = ?
      ORDER BY h.deadline DESC
    `,
        [teacherId],
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  // controllers/teacherController.js

  async teacherPlans(req, res) {
    const { id } = req.params; // teacher_id
    const result = await db.query(`SELECT * FROM plans WHERE teacher_id = ?`, [
      id,
    ]);
    res.json(result[0]);
  }
  async getPlanInstance(req, res) {
    try {
      const [rows] = await db.query(`SELECT * FROM plan_instances`);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  async planInstance(req, res) {
    const { planId } = req.params; // plan_id;
    const result = await db.query(
      `SELECT * FROM plan_instances WHERE plan_id = ?`,
      [planId],
    );
    res.json(result[0]);
  }
  async getProducts(req, res) {
    try {
      const [products] = await db.query(
        `SELECT * FROM shop_products WHERE is_active = TRUE`,
      );
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching products" });
    }
  }
  async getOrders(req, res) {
    try {
      const [orders] = await db.query(`
      SELECT o.*, u.firstName, u.lastName
      FROM shop_orders o
      JOIN students u ON o.student_id = u.id
      ORDER BY o.created_at DESC;
    `);

      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching orders" });
    }
  }
  async getOrdersItem(req, res) {
    try {
      const { orderId } = req.body;
      const [orderItems] = await db.query(`SELECT * FROM shop_order_items`);
      res.json(orderItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching order items" });
    }
  }
  async planTopics(req, res) {
    const { planId } = req.params; // plan_id
    const result = await db.query(`SELECT * FROM topics WHERE plan_id = ?`, [
      planId,
    ]);
    res.json(result[0]);
  }
  async createProduct(req, res) {
  try {
    const { name, description, price_coins, stock } = req.body;

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ message: "Image is required" });
    }

    // File is now saved in /uploads
    const image_url = `/uploads/${req.file.filename}`;

    console.log("Saving:", { name, description, price_coins, stock, image_url });

    await db.query(
      `INSERT INTO shop_products (name, description, price_coins, image_url, stock)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price_coins, image_url, stock]
    );

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
  async createOrder(req, res) {
  const { student_id, items } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(
      `SELECT * FROM student_coins WHERE student_id = ?`,
      [student_id],
    );

    if (!user) throw new Error("User not found");

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    const total = items.reduce(
      (acc, item) => acc + item.price_coins * item.quantity,
      0
    );

    if (user.coins < total) {
      throw new Error("Insufficient funds");
    }

    const [orderResult] = await connection.query(
      `INSERT INTO shop_orders (student_id, total_coins)
       VALUES (?, ?)`,
      [student_id, total],
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO shop_order_items 
         (order_id, product_id, quantity, price_at_time)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price_coins],
      );
    }

    await connection.query(
      `UPDATE student_coins 
       SET coins = coins - ? 
       WHERE student_id = ?`,
      [total, student_id]
    );

    await connection.commit();

    res.json({ success: true, message: "Order created successfully" });

  } catch (err) {
    await connection.rollback();
    console.error(err.message);
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
}
  async addExercises(req, res) {
    const { id } = req.params; // homework_id
    const { exercises } = req.body;

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: "No exercises provided" });
    }

    try {
      const values = exercises.map((ex, index) => [
        id,
        ex.exercise_type_id,
        ex.question,
        JSON.stringify(ex.data || {}),
        ex.points || 1,
        ex.order_index ?? index,
      ]);

      await db.query(
        `
      INSERT INTO exercises
      (homework_id, exercise_type_id, question, data, points, order_index)
      VALUES ?
      `,
        [values],
      );

      res.status(201).json({ message: "Exercises added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding exercises" });
    }
  }
  async assignHomeworkStudent(req, res) {
    const { id: homework_id } = req.params;
    const { student_ids } = req.body; // array of student IDs

    for (let student_id of student_ids) {
      await db.query(
        `
      INSERT INTO student_homework (student_id, homework_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE homework_id = homework_id
    `,
        [student_id, homework_id],
      );
    }

    res.json({ success: true });
  }
  async assignHomework(req, res) {
    const { groupId: homework_id } = req.params;
    const { class_ids } = req.body; // array

    if (!class_ids || class_ids.length === 0) {
      return res.status(400).json({ error: "class_ids required" });
    }

    try {
      for (let class_id of class_ids) {
        await db.query(
          `
        INSERT INTO homework_classes (homework_id, class_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE class_id = class_id
        `,
          [homework_id, class_id],
        );
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
  async updateStudentProfile(req, res) {
    try {
      const { firstName, lastName, phone, fatherPhone, motherPhone, birthday } =
        req.body;
      const studentId = req.user?.id || req.body.student_id; // Assuming user is authenticated and student ID is in the token
      const image = req.file ? req.file.filename : null;

      // ✅ Update query
      await db.query(
        `UPDATE students 
        SET firstName = ?, 
            lastName = ?, 
            birthday = ?,
            phone = ?,
            fatherPHone = ?, 
            motherPhone = ?, 
            image = COALESCE(?, image)
        WHERE id = ?`,
        [
          firstName,
          lastName,
          birthday,
          phone,
          fatherPhone,
          motherPhone,
          image,
          studentId,
        ],
      );

      res.json({
        success: true,
        message: "Profile updated",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
  async submitHomework(req, res) {
    try {
      const { student_id, homework_id, answers } = req.body;

      const results = [];

      let studentScore = 0;

      for (let a of answers) {
        const [exercise] = await db.query(
          "SELECT data, points FROM exercises WHERE id = ?",
          [a.exercise_id],
        );

        if (!exercise[0]) continue;

        const exerciseData =
          typeof exercise[0].data === "string"
            ? JSON.parse(exercise[0].data)
            : exercise[0].data;

        const correctAnswer =
          exerciseData.options?.[exerciseData.correctAnswerIndex];

        const submitted =
          typeof a.answer === "string" ? a.answer.trim() : a.answer;

        const correct =
          typeof correctAnswer === "string"
            ? correctAnswer.trim()
            : correctAnswer;

        const is_correct =
          typeof submitted === "string" && typeof correct === "string"
            ? submitted.toLowerCase() === correct.toLowerCase()
            : submitted === correct;

        const points = exercise[0].points || 0;
        const earned = is_correct ? points : 0;
        studentScore += earned;

        await db.query(
          `
        INSERT INTO student_answers 
        (student_id, exercise_id, answer, is_correct, score)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          answer = VALUES(answer),
          is_correct = VALUES(is_correct),
          score = VALUES(score)
        `,
          [
            student_id,
            a.exercise_id,
            JSON.stringify(a.answer),
            is_correct,
            earned,
          ],
        );

        results.push({
          exercise_id: a.exercise_id,
          is_correct,
          score: earned,
        });
      }

      // get homework reward (max score)
      const [homework] = await db.query(
        "SELECT coins_reward FROM homeworks WHERE id = ?",
        [homework_id],
      );

      const coinsReward = homework[0]?.coins_reward || 0;

      // save homework submission
      await db.query(
        `
      INSERT INTO student_homework 
      (student_id, homework_id, status, submitted_at, score, coins_earned)
      VALUES (?, ?, 'submitted', NOW(), ?, ?)
      ON DUPLICATE KEY UPDATE
        status = 'submitted',
        submitted_at = NOW(),
        score = VALUES(score),
        coins_earned = VALUES(coins_earned)
      `,
        [student_id, homework_id, coinsReward, studentScore],
      );

      res.json({
        success: true,
        results,
        total_score: coinsReward,
        coins_earned: studentScore,
      });
    } catch (err) {
      console.error("Submit Homework Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async createHomework(req, res) {
    const {
      subject_id,
      level_id,
      title,
      description,
      deadline,
      coins_reward,
      given_by,
      student_id,
      class_id,
    } = req.body;

    try {
      const [result] = await db.query(
        `
  INSERT INTO homeworks
  (subject_id, level_id, title, description, deadline, coins_reward, given_by, student_id, class_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
          subject_id,
          level_id,
          title,
          description,
          deadline,
          coins_reward,
          given_by,
          student_id || null,
          class_id || null,
        ],
      );

      res.json({ homework_id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }

  async createStar(req, res) {
    const { studentId, date, not_late, actives, homework, given_by, classId } =
      req.body;
    const result = await db.query(
      `INSERT INTO lesson_stars (student_id, class_id, lesson_date, not_late, actives, homework, given_by) VALUES (${studentId}, ${classId}, '${date}', ${not_late}, ${actives}, ${homework}, '${given_by}')`,
    );
    res.json(result);
  }
  async updateStar(req, res) {
    const { not_late, actives, homework, id } = req.body;
    const result = await db.query(
      `UPDATE lesson_stars SET not_late = '${not_late}', actives = '${actives}', homework = '${homework}' WHERE id = ${id};`,
    );
    res.json(result);
  }
  async createTeacher(req, res) {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      sex,
      subjects,
      phone,
    } = req.body;
    const checkEmail = await db.query(
      `SELECT * FROM students WHERE email = '${email}'`,
    );
    const checkId = checkEmail[0];
    if (checkId[0] === undefined) {
      const result = await db.query(
        `INSERT INTO students (firstName, lastName, email, username, password, sex, phone, subjects, role) VALUES('${firstName}', '${lastName}', '${email}', '${username}', '${password}', '${sex}', '${phone}', JSON_ARRAY('${subjects}'), 'teacher')`,
      );
      return res.json({ message: "Teacher registered successfully" });
    } else {
      res.json({ message: "Teacher already exists" });
    }
  }
  async createStudent(req, res) {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      sex,
      phone,
      fatherPhone,
      motherPhone,
      subjects,
      dateDay,
    } = req.body;
    const checkEmail = await db.query(
      `SELECT * FROM students WHERE email = '${email}'`,
    );
    const checkId = checkEmail[0];
    if (checkId[0] === undefined) {
      const result = await db.query(
        `INSERT INTO students (firstName, lastName, email, username, password, sex, phone, role, fatherPHone, motherPhone, subjects, keldi) VALUES('${firstName}', '${lastName}', '${email}', '${username}', '${password}', '${sex}', '${phone}', 'student', '${fatherPhone}', '${motherPhone}', '${subjects}', '${dateDay}')`,
      );
      return res.json({ message: "Student registered successfully" });
    } else {
      res.json({ message: "Student already exists" });
    }
  }
  async createGroup(req, res) {
    const {
      groupName,
      subjects,
      startTime,
      endTime,
      lessonDate,
      firstName,
      lastName,
    } = req.body;
    const group =
      await db.query(`INSERT INTO class (name, subject, startTime, endTime, day, firstName, lastName)
                      VALUES ('${groupName}', '${subjects}', '${startTime}', '${endTime}', '${lessonDate}', '${firstName}', '${lastName}')`);
    const user = await db.query(
      `SELECT * FROM students WHERE firstName = '${firstName}' AND lastName = '${lastName}'`,
    );
    const userData = user[0];
    const className = userData[0].classes;
    const teacherUpdate = await db.query(
      `UPDATE students SET className = '${className} ${groupName}' WHERE id = ${userData[0].id};`,
    );
    return res.json({ message: "Group created successfully" });
  }
  async createPlan(req, res) {
    const { title, teacherId, level } = req.body;

    const result = await db.query(
      `INSERT INTO plans (title, teacher_id, level) VALUES (?, ?, ?)`,
      [title, teacherId, level],
    );
    res.json({ id: result[0].insertId, message: "Plan created successfully" });
  }
  async createTopic(req, res) {
    const { planId, type, title, description, order_index } = req.body;
    const result = await db.query(
      `INSERT INTO topics (plan_id, type, title, description, order_index) VALUES (?, ?, ?, ?, ?)`,
      [planId, type, title, description, order_index],
    );
    res.json({ message: "Topic created successfully" });
  }
  async createPlanInstance(req, res) {
    const { planId, group_id, start_date, end_date } = req.body;
    const result = await db.query(
      `INSERT INTO plan_instances (plan_id, group_id, start_date, end_date) VALUES (?, ?, ?, ?)`,
      [planId, group_id, start_date, end_date],
    );
    res.json({ message: "Plan assigned" });
  }
  async transferHomeworkCoins(req, res) {
    try {
      const { student_id, homework_id, class_id, given_by } = req.body;

      // 1. Get latest coins
      const [rows] = await db.query(
        `SELECT coins_earned
       FROM student_homework
       WHERE student_id = ? AND homework_id = ?`,
        [student_id, homework_id],
      );

      if (!rows.length) {
        return res.json({ success: false, message: "Homework not found" });
      }

      const coins = rows[0].coins_earned || 0;

      // 2. Check if record exists
      const [existing] = await db.query(
        `SELECT id FROM lesson_stars 
       WHERE student_id = ? AND homework_id = ?`,
        [student_id, homework_id],
      );

      if (existing.length) {
        // ✅ FIX: replace instead of adding
        await db.query(
          `UPDATE lesson_stars
         SET bonus = ?
         WHERE student_id = ? AND homework_id = ?`,
          [coins, student_id, homework_id],
        );
      } else {
        await db.query(
          `INSERT INTO lesson_stars 
        (student_id, class_id, given_by, bonus, homework_id)
        VALUES (?, ?, ?, ?, ?)`,
          [student_id, class_id, given_by, coins, homework_id],
        );
      }

      res.json({
        success: true,
        coinsEarned: coins,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  }
  async addStudent(req, res) {
    const {
      groupName,
      subjects,
      startTime,
      endTime,
      lessonDate,
      firstName,
      lastName,
    } = req.body;
    const group =
      await db.query(`INSERT INTO class (name, subject, startTime, endTime, day, firstName, lastName)
                      VALUES ('${groupName}', '${subjects}', '${startTime}', '${endTime}', '${lessonDate}', '${firstName}', '${lastName}')`);
    res.json({ message: "Student registered successfully" });
  }
  async createTheme(req, res) {
    const { group, theme, lessonDate } = req.body;
    const result = await db.query(
      `INSERT INTO homework (name, theme, date) VALUES ('${group}', '${theme}', '${lessonDate}')`,
    );
    res.json(result);
  }

  async studentAttendance(req, res) {
    const { studentId, date, classId, status } = req.body;
    const user = await db.query(`
      INSERT INTO attendance (student_id, attendance_date, class_id, status)
      VALUES (${studentId}, '${date}', '${classId}', '${status}')
      ON DUPLICATE KEY UPDATE status = '${status}';`);
    res.json(user);
  }
  async loginUsers(req, res) {
    try {
      const { email, password } = req.body;
      const result = await db.query(
        `SELECT * FROM students WHERE email = '${email}' AND password = '${password}'`,
      );
      const user = result[0];
      const id = user[0].id;
      const name = user[0].name;
      if (user[0] === undefined) {
        res.json({ message: "User does not exist" });
      }

      const sessionToken = generateRandomToken();
      await storeSessionToken(id, sessionToken);
      return res.json(user[0]);

      // res.json(result);
    } catch (error) {
      console.error("🚨 Login Error:", error);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      res
        .status(500)
        .json({ message: error.message || "Server error during login" });
    }
  }
  async getUsersById(req, res) {
    try {
      const id = req.body;
      const result = await db.query(
        `SELECT * FROM students WHERE id = '${id.id}'`,
      );
      const userId = result[0];
      const user = userId[0];
      res.json(user);
    } catch (error) {
      res.json(error);
    }
  }

  async getAdmin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await db.query(
        `SELECT * FROM admin WHERE email = '${email}' AND password = '${password}'`,
      );
      const admin = result[0];
      if (admin[0] === undefined) {
        return res.json({ message: "User don't exist" });
      }
      return res.json(admin[0]);
    } catch (error) {
      res.json(error);
    }
  }
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        motherPhone,
        fatherPhone,
        username,
        subjects,
        groupName,
      } = req.body;
      const response = await db.query(
        `SELECT * FROM students WHERE id = '${id}'`,
      );
      const user = response[0];
      const className = user[0].className;
      const result = await db.query(
        `UPDATE students SET firstName = '${firstName}', lastName = '${lastName}', email = '${email}', password = '${password}', phone = '${phone}', fatherPHone = '${fatherPhone}', motherPhone = '${motherPhone}', username = '${username}', subjects =  '${subjects}', className = '${groupName}, ${className}' WHERE id = '${id}'`,
      );

      if (user[0].id === undefined) {
        return res.json({ message: "User don't exist" });
      } else {
        res.json({ message: "User updated successfully" });
        // return res.json(user[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        motherPhone,
        fatherPhone,
        username,
        subjects,
        groupName,
      } = req.body;
      const result = await db.query(
        `UPDATE students SET firstName = '${firstName}', lastName = '${lastName}', email = '${email}', password = '${password}', phone = '${phone}', fatherPHone = '${fatherPhone}', motherPhone = '${motherPhone}', username = '${username}', subjects =  '${subjects}', className = '${groupName}' WHERE id = '${id}'`,
      );
      const response = await db.query(
        `SELECT * FROM students WHERE id = '${id}'`,
      );
      const user = response[0];
      if (user[0].id === undefined) {
        return res.json({ message: "User don't exist" });
      } else {
        res.json({ message: "User updated successfully" });
        // return res.json(user[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const {
        groupName,
        subjects,
        startTime,
        endTime,
        lessonDate,
        firstName,
        lastName,
      } = req.body;
      const result = await db.query(
        `UPDATE class SET name = '${groupName}', subject = '${subjects}', startTime = '${startTime}', endTime = '${endTime}', days = JSON_ARRAY('${lessonDate}') WHERE classId = '${id}'`,
      );
      const teacherUpdate = await db.query(`UPDATE students 
        SET classes = JSON_ARRAY('${groupName}') 
        WHERE firstName = '${firstName}' AND lastName = '${lastName}'`);
      res.json({ message: "Group updated successfully" });
    } catch (error) {
      return res.json(error);
    }
  }

  updateDay(req, res) {
    const { id, amountPaid, wayPaid, way, columnName } = req.body;
    const result = db.query(
      `UPDATE payment SET ${columnName} = '${amountPaid}', ${way} = '${wayPaid}'  WHERE payment_id = ${id}`,
    );
    res.json(result);
  }

  async updateHomework(req, res) {
    const { group, lessonDate, theme } = req.body;
    const result = db.query(
      `UPDATE homework SET theme = '${theme}' WHERE name = '${group}' AND date = '${lessonDate}'`,
    );
    res.json(result);
  }
  async updateStatus(req, res) {
    const { id, formattedDate } = req.body;
    const result = db.query(
      `UPDATE students SET ketdi = '${formattedDate}', keldi = '' WHERE id = ${id}`,
    );
    res.json(result);
  }
  async updateStatusChange(req, res) {
    const { id, formattedDate } = req.body;
    const result = db.query(
      `UPDATE students SET ketdi = '', keldi = '${formattedDate}' WHERE id = ${id}`,
    );
    res.json(result);
  }
  async updateTopic(req, res) {
    const { id } = req.params;
    const { type, title, description, order_index } = req.body;

    await db.query(
      `UPDATE topics 
      SET type = ?, title = ?, description = ?, order_index = ?
      WHERE id = ?`,
      [type, title, description, order_index, id],
    );

    res.json({ message: "Topic updated" });
  }
  async updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [[order]] = await connection.query(
        "SELECT * FROM shop_orders WHERE id = ?",
        [id],
      );

      if (!order) throw new Error("Order not found");

      if (order.status !== "pending") {
        throw new Error("Order already processed");
      }

      // ✅ If approved → deduct coins
      if (status === "approved") {
        await connection.query(
          "UPDATE student_coins SET coins = coins - ? WHERE id = ?",
          [order.total_coins, order.student_id],
        );
      }

      // Update order status
      await connection.query(
        `UPDATE shop_orders 
        SET status = ?, approved_at = NOW()
        WHERE id = ?`,
        [status, id],
      );

      await connection.commit();

      res.json({ message: "Order updated" });
    } catch (err) {
      await connection.rollback();
      console.error(err.message);
      res.status(400).json({ message: err.message });
    } finally {
      connection.release();
    }
  }
  async updateProducts(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price_coins, stock } = req.body;

      // ✅ handle image properly
      let image_url;

      if (req.file) {
        // new uploaded file
        image_url = `/uploads/${req.file.filename}`;
      } else {
        // fallback to existing image
        image_url = req.body.image_url;
      }

      const result = await db.query(
        `UPDATE shop_products
       SET name = ?, description = ?, price_coins = ?, stock = ?, image_url = ?
       WHERE id = ?`,
        [name, description, price_coins, stock, image_url, id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product updated" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
  async deleteGroup(req, res) {
    try {
      const { id } = req.body;
      const safe = await db.query(`SET SQL_SAFE_UPDATES = 0;`);
      const result = await db.query(`DELETE FROM class WHERE classId = ${id}`);
      res.json({ message: "Group deleted successfully" });
    } catch (error) {
      console.error(error);
    }
  }
  async deleteUser(req, res) {
    try {
      const { tab, firstName, lastName } = req.body;
      const safe = await db.query(`SET SQL_SAFE_UPDATES = 0;`);
      const update = await db.query(`SET FOREIGN_KEY_CHECKS = 0;`);
      const result = await db.query(
        `DELETE FROM class WHERE name = '${tab}' AND firstName = '${firstName}' AND lastName = '${lastName}';`,
      );
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
    }
  }
  async deleteStudent(req, res) {
    try {
      const { id } = req.body;
      const update = await db.query(`SET FOREIGN_KEY_CHECKS = 0;`);
      const result = await db.query(`DELETE FROM students WHERE id = ${id};`);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
    }
  }
  async deletePlanInstance(req, res) {
    try {
      const { id } = req.params;
      await db.query(`DELETE FROM plan_instances WHERE id = ?`, [id]);
      res.json({ message: "Plan instance deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting plan instance" });
    }
  }
  async deleteProducts(req, res) {
    try {
      const { id } = req.params;
      await db.query(`DELETE FROM shop_products WHERE id = ?`, [id]);
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting product" });
    }
  }
}

module.exports = new UserController();
