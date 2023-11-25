import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const data = await prisma.users.findMany({
      select: { id: true, username: true, nama: true },
    });
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Unauthorized",
    });
  }
};

export const getUsersById = async (req, res) => {
  try {
    const data = await prisma.users.findMany({
      where: {
        id: Number(req.params.id),
      },
      select: {
        id: true,
        username: true,
        nama: true,
        jabatan: true,
      },
    });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

export const registerUsers = async (req, res) => {
  const { username, password, nama, id_karyawan, jabatan } = req.body;
  const idKaryawan = Number(id_karyawan);
  try {
    // Periksa apakah username sudah ada dalam database
    const existingUsername = await prisma.users.findUnique({
      where: { username: username },
    });

    // Periksa apakah idKaryawan sudah ada dalam database
    const existingIdKaryawan = await prisma.users.findUnique({
      where: { id: idKaryawan },
    });

    if (existingUsername) {
      return res.status(400).json({
        status: "fail",
        message: "Username already registered",
      });
    }

    if (existingIdKaryawan) {
      return res.status(400).json({
        status: "fail",
        message: "ID Karyawan already registered",
      });
    }

    await prisma.users.create({
      data: {
        username: username,
        nama: nama,
        id: idKaryawan,
        jabatan: jabatan,
        password: password,
      },
    });

    res.json({
      status: "success",
      data: {
        username: username,
        nama: nama,
        id_karyawan: id_karyawan,
        jabatan: jabatan,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

export const loginUsers = async (req, res) => {
  try {
    const user = await prisma.users.findMany({
      where: {
        username: req.body.username,
      },
    });
    console.log(user[0]);

    if (req.body.password !== user[0].password)
      return res
        .status(400)
        .json({ status: "fail", message: "Username or password wrong" });

    function calculateNextMidnight() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Atur jam ke 00:00:00
      return midnight;
    }

    const nextMidnight = calculateNextMidnight();

    const userId = user[0].id;
    const username = user[0].username;
    const nama = user[0].nama;
    const jabatan = user[0].jabatan;
    const accessToken = jwt.sign(
      { userId, username, nama, jabatan },
      process.env.ACCESS_TOKEN_SECRET
      // {
      //   expiresIn: "15s",
      // }
    );
    const refreshToken = jwt.sign(
      { userId, username, nama, jabatan },
      process.env.REFRESH_TOKEN_SECRET,
      {
        // expiresIn: Math.floor((nextMidnight - new Date()) / 1000), // Hitung selisih waktu dalam detik
        expiresIn: "1d",
      }
    );

    await prisma.users.update({
      data: { token: refreshToken },
      where: {
        id: userId,
      },
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      //   secure: true, //untuk https server global
    });
    res.json({
      status: "success",
      data: {
        user_id: userId,
        token: accessToken,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: "fail", message: "Username or password wrong" });
  }
};

export const logoutUsers = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    const user = await prisma.users.findMany({
      where: {
        token: refreshToken,
      },
    });
    if (!user[0])
      return res.status(400).json({ status: "fail", message: "Unauthorized" });

    const userId = user[0].id;

    await prisma.users.update({
      data: { token: null },
      where: {
        id: userId,
      },
    });
    res.clearCookie("refreshToken");
    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "fail",
      message: "error lainya",
    });
  }
};

export const updateUsers = async (req, res) => {
  const { username, nama, jabatan } = req.body;
  const userId = Number(req.params.id);

  try {
    // Periksa apakah username sudah ada dalam database
    const user = await prisma.users.findFirst({
      where: { username },
    });

    if (user) {
      return res.status(400).json({
        status: "fail",
        message: "Username already registered",
      });
    }

    await prisma.log.updateMany({
      where: {
        users_id: userId,
      },
      data: {
        nama_user: nama,
      },
    });

    const data = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
        nama: nama,
        jabatan: jabatan,
      },
    });
    console.log(data);

    res.status(201).json({
      status: "Success Update Users",
      data: {
        id: data.id,
        username: data.username,
        nama: data.nama,
        jabatan: data.jabatan,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "fail",
      message: "ip already used / error lainya",
    });
  }
};

export const deleteUsers = async (req, res) => {
  try {
    const users = Number(req.params.id);
    // Mendapatkan data user
    const user = await prisma.users.findUnique({
      where: {
        id: users,
      },
    });

    if (!user) return res.status(404).json({ msg: "id users tidak ditemukan" });
    const userId = user.id;
    const username = user.username;
    const nama = user.nama;

    await prisma.log.deleteMany({
      where: {
        users_id: userId,
      },
    });

    await prisma.users.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      status: "success delete users",
      data: {
        user_id: userId,
        username: username,
        nama: nama,
      },
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
