// Import modul PrismaClient dari package @prisma/client
import { PrismaClient } from "@prisma/client"; 
// Import modul jwt untuk manajemen JSON Web Tokens
import jwt from "jsonwebtoken"; 

// Inisialisasi PrismaClient untuk berinteraksi dengan database
const prisma = new PrismaClient(); 

// Membuat fungsi getUsers yang bersifat asynchronous
export const getUsers = async (req, res) => {
  try {
    // Mengambil data pengguna dari database menggunakan Prisma
    const data = await prisma.users.findMany({
      // Memilih kolom data yang akan ditampilkan (id, username, nama)
      select: { id: true, username: true, nama: true },
    });

    // Mengembalikan respons dengan status sukses dan data pengguna yang berhasil diambil
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    // Mengembalikan respons dengan status fail dan pesan "Unauthorized" jika terjadi kesalahan
    res.status(500).json({
      status: "fail",
      message: "Unauthorized",
    });
  }
};

// Membuat fungsi getUsersById yang bersifat asynchronous
export const getUsersById = async (req, res) => { 
  try {
    // Mengambil data pengguna dari database berdasarkan ID yang diberikan
    const data = await prisma.users.findMany({ 
      // Mencocokkan ID pengguna dengan nilai yang diterima dari parameter permintaan (req.params.id)
      where: {
        id: Number(req.params.id), 
      },
      // Memilih untuk menampilkan kolom (id, username, nama, jabatan)
      select: {
        id: true, 
        username: true,
        nama: true,
        jabatan: true,
      },
    });
    
    // Mengembalikan respons dengan status sukses dan data pengguna yang berhasil diambil  
    res.status(200).json({ 
      status: "success",
      data,
    });
  } catch (error) {
    // Mengembalikan respons dengan status fail dan pesan "Unauthorized" jika terjadi kesalahan
    res.status(500).json({
      status: "fail",
      message: "Unauthorized",
    });
  }
};

// Membuat fungsi registerUsers yang bersifat asynchronous
export const registerUsers = async (req, res) => {
  // Mendeklarasikan variabel dengan mengambil nilai dari properti body pada permintaan (request)
  const { username, password, nama, id_karyawan, jabatan } = req.body;
  // Mengonversi id_karyawan menjadi tipe data Number
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

    // Jika username sudah terdaftar, kirim respons dengan status 400 dan pesan "Username already registered"
    if (existingUsername) {
      return res.status(400).json({
        status: "fail",
        message: "Username already registered",
      });
    }

    // Jika idKaryawan sudah terdaftar, kirim respons dengan status 400 dan pesan "ID Karyawan already registered"
    if (existingIdKaryawan) {
      return res.status(400).json({
        status: "fail",
        message: "ID Karyawan already registered",
      });
    }

    // Jika username dan idKaryawan belum terdaftar, buat pengguna baru di database
    await prisma.users.create({
      data: {
        username: username,
        nama: nama,
        id: idKaryawan,
        jabatan: jabatan,
        password: password,
      },
    });

    // Kirim respons dengan status "success" dan data pengguna yang baru terdaftar
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
    // Kirim respons dengan status 500 dan pesan kesalahan
    res.status(500).json({ message: error.message });
  }
};

// Membuat fungsi loginUsers yang bersifat asynchronous
export const loginUsers = async (req, res) => {
  try {
    // Mengambil data pengguna dari database berdasarkan username yang diberikan dalam permintaan (request)
    const user = await prisma.users.findMany({
      where: {
        username: req.body.username,
      },
    });

    // Memeriksa apakah pengguna dengan username yang diberikan ditemukan dan apakah password sesuai
    if (user.length === 0 || req.body.password !== user[0].password){
      return res.status(400).json({ status: "fail", message: "Username or password wrong" });
    }

    // Mendapatkan informasi pengguna yang berhasil login
    const userId = user[0].id;
    const username = user[0].username;
    const nama = user[0].nama;
    const jabatan = user[0].jabatan;

    // Membuat token akses (JWT) dengan informasi pengguna dan menyimpannya dalam variabel accessToken
    const accessToken = jwt.sign(
      { userId, username, nama, jabatan },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // Token berlaku selama 1 hari
        expiresIn: "1d",
      }
    );

    // Memperbarui token pengguna di database
    await prisma.users.update({
      data: { token: accessToken },
      where: {
        id: userId,
      },
    });

    // Menyimpan token akses dalam cookie untuk pengguna
    res.cookie("accessToken", accessToken, {
      // httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // Waktu kedaluwarsa cookie setelah 24 jam
      secure: true, //untuk https server global
    });
    
    // Menyampaikan respons dengan status "success" dan data pengguna yang berhasil login
    res.json({
      status: "success",
      data: {
        user_id: userId,
        token: accessToken,
      },
    });
  } catch (error) {
    // Menangkap kesalahan jika terjadi
    res.status(400).json({ status: "fail", message: "Username or password wrong" });
  }
};

// Membuat fungsi logoutUsers yang bersifat asynchronous
export const logoutUsers = async (req, res) => {
  try {
    // Mendapatkan token akses dari cookie dalam permintaan (request)
    const accessToken = req.cookies.accessToken;

    // if (!accessToken)
    //   return res.status(401).json({ status: "fail", message: "Unauthorized" });

    // Mengambil pengguna berdasarkan token akses
    const user = await prisma.users.findMany({
      where: {
        token: accessToken,
      },
    });

    // if (!user[0])
    //   return res.status(400).json({ status: "fail", message: "Unauthorized" });

    const userId = user[0].id;

    // Memperbarui token pengguna di database menjadi null, menandakan bahwa pengguna telah logout
    await prisma.users.update({
      data: { token: null },
      where: {
        id: userId,
      },
    });
    
    // Menghapus cookie token akses dari pengguna
    res.clearCookie("accessToken");

    // Mengirim respons dengan status "success" setelah berhasil logout
    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    // Menangkap kesalahan jika terjadi
    return res.status(400).json({
      status: "fail",
      message: "Unauthorized",
    });
  }
};

//Membuat fungsi updateUsers yang bersifat asynchronous
export const updateUsers = async (req, res) => {
  // Mendapatkan ID pengguna dari parameter permintaan (request)
  const userId = Number(req.params.id);

  // Mendapatkan data yang ingin diperbarui dari properti body pada permintaan (request)
  const { username, nama, jabatan } = req.body;

  try {
    // Mencari pengguna yang akan diperbarui berdasarkan ID
    const existingUser = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    // Jika pengguna tidak ditemukan, kirim respons dengan status 404 dan pesan "User not found"
    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Objek untuk menyimpan data yang ingin diperbarui
    const updatedData = {};

    // Memeriksa apakah data yang ingin diperbarui disertakan dalam permintaan dan memperbarui objek updatedData
    if (username) {
      updatedData.username = username;
    }

    if (nama) {
      updatedData.nama = nama;
    }

    if (jabatan) {
      updatedData.jabatan = jabatan;
    }

    // Melakukan pembaruan data pengguna di database berdasarkan ID
    const data = await prisma.users.update({
      where: {
        id: userId,
      },
      data: updatedData,
    });

    // Mengirim respons dengan status 201 (Created) dan data pengguna yang berhasil diperbarui
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
    // Menangkap kesalahan jika terjadi
    return res.status(400).json({
      status: "fail",
      message: "Error updating user data",
    });
  }
};

// Membuat fungsi deleteUsers yang bersifat asynchronous
export const deleteUsers = async (req, res) => {
  try {
    // Mendapatkan ID pengguna dari parameter permintaan (request)
    const users = Number(req.params.id);

    // Mendapatkan data pengguna berdasarkan ID
    const user = await prisma.users.findUnique({
      where: {
        id: users,
      },
    });

     // Jika pengguna dengan ID tersebut tidak ditemukan, kirim respons dengan status 404 dan pesan "id users tidak ditemukan"
    if (!user) return res.status(404).json({ msg: "id users tidak ditemukan" });

    // Mendapatkan informasi pengguna yang akan dihapus
    const userId = user.id;
    const username = user.username;
    const nama = user.nama;

    // Menghapus entri log yang terkait dengan pengguna
    await prisma.log.deleteMany({
      where: {
        users_id: userId,
      },
    });

    // Menghapus pengguna dari database berdasarkan ID
    await prisma.users.delete({
      where: {
        id: userId,
      },
    });

    // Mengirim respons dengan status 200 (OK) dan informasi pengguna yang berhasil dihapus
    res.status(200).json({
      status: "success delete users",
      data: {
        user_id: userId,
        username: username,
        nama: nama,
      },
    });
  } catch (error) {
     // Menangkap kesalahan jika terjadi
    res.status(400).json({ msg: error.message });
  }
};

