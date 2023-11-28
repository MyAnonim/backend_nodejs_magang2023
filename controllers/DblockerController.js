import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export const getDrone = async (req, res) => {
  try {
    const data = await prisma.dblocker.findMany({
      include: {
        log: {
          select: {
            rc_state: true,
            gps_state: true,
            temp: true,
          },
        },
      },
    });

    // Pengecekan apakah data tidak kosong
    if (data.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          dblockers: [],
        },
      });
    }

    // Mendapatkan objek tanggal dari createdAt
    const createdAtDate = data[0]?.createdAt;

    // Memformat tanggal menjadi "DD-MM-YYYY"
    const day = createdAtDate.getDate().toString().padStart(2, "0");
    const month = (createdAtDate.getMonth() + 1).toString().padStart(2, "0");
    const year = createdAtDate.getFullYear();

    const tgl_aktif = `${day}-${month}-${year}`;

    const dblockers = data.map((dblocker) => {
      const { id, nomor_seri, ip_addr, latitude, longitude, log, area_name } =
        dblocker;
      // Mengambil data terakhir dari log jika tersedia
      const lastLog = log.length > 0 ? log[log.length - 1] : null;

      const jammer_rc = lastLog ? lastLog.rc_state : null;
      const jammer_gps = lastLog ? lastLog.gps_state : null;
      const temp = lastLog ? lastLog.temp : null;

      return {
        id,
        no_seri: nomor_seri,
        ip_addr,
        area_name,
        latitude,
        longitude,
        tgl_aktif: tgl_aktif,
        jammer_rc,
        jammer_gps,
        temp,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        dblockers,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Errors fetch data",
    });
  }
};

export const getDroneById = async (req, res) => {
  try {
    const data = await prisma.dblocker.findMany({
      where: {
        id: Number(req.params.id),
      },
      include: {
        log: {
          select: {
            rc_state: true,
            gps_state: true,
            temp: true,
          },
        },
      },
    });
    // Mendapatkan objek tanggal dari createdAt
    const createdAtDate = data[0].createdAt;

    // Memformat tanggal menjadi "DD-MM-YYYY"
    const day = createdAtDate.getDate().toString().padStart(2, "0");
    const month = (createdAtDate.getMonth() + 1).toString().padStart(2, "0");
    const year = createdAtDate.getFullYear();

    const tgl_aktif = `${day}-${month}-${year}`;

    const dblockers = data.map((dblocker) => {
      const { id, nomor_seri, ip_addr, latitude, longitude, log, area_name } =
        dblocker;
      // Mengambil data terakhir dari log jika tersedia
      const lastLog = log.length > 0 ? log[log.length - 1] : null;

      const jammer_rc = lastLog ? lastLog.rc_state : null;
      const jammer_gps = lastLog ? lastLog.gps_state : null;
      const temp = lastLog ? lastLog.temp : null;

      return {
        id,
        no_seri: nomor_seri,
        ip_addr,
        area_name,
        latitude,
        longitude,
        tgl_aktif: tgl_aktif,
        jammer_rc,
        jammer_gps,
        temp,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        dblockers,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const addDrone = async (req, res) => {
  const { nomor_seri, area_name, ip_addr, location } = req.body;

  try {
    const refreshToken = req.cookies.refreshToken;

    const user = await prisma.users.findMany({
      where: {
        token: refreshToken,
      },
    });

    // Mendapatkan latitude dan longitude dari properti 'location'
    const [latitude, longitude] = location;

    // Mengonversi latitude dan longitude ke dalam format string
    const latitudeString = latitude.toString();
    const longitudeString = longitude.toString();

    const dblockers = await prisma.dblocker.create({
      data: {
        nomor_seri: nomor_seri,
        area_name: area_name,
        ip_addr: ip_addr,
        latitude: latitudeString,
        longitude: longitudeString,
      },
    });
    const logs = await prisma.log.create({
      data: {
        users_id: user[0].id,
        nama_user: user[0].nama,
        dblocker_id: dblockers.id,
        area_name: area_name,
      },
    });

    // Mendapatkan objek tanggal dari createdAt
    const createdAtDate = dblockers.createdAt;

    // Memformat tanggal menjadi "DD-MM-YYYY"
    const day = createdAtDate.getDate().toString().padStart(2, "0");
    const month = (createdAtDate.getMonth() + 1).toString().padStart(2, "0");
    const year = createdAtDate.getFullYear();

    const tgl_aktif = `${day}-${month}-${year}`;

    res.status(201).json({
      status: "success",
      data: {
        id: dblockers.id,
        no_seri: nomor_seri,
        ip_addr: ip_addr,
        location: [latitude, longitude],
        tgl_aktif: tgl_aktif,
        jammer_rc: logs.rc_state,
        jammer_gps: logs.gps_state,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: "nomer seri already registered / ip already used / error lainya",
    });
  }
};

export const updateDrone = async (req, res) => {
  const { nomor_seri, area_name, ip_addr, location } = req.body;

  try {
    const [latitude, longitude] = location;

    // Mengonversi latitude dan longitude ke dalam format string
    const latitudeString = latitude.toString();
    const longitudeString = longitude.toString();

    const data = await prisma.dblocker.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        nomor_seri: nomor_seri,
        area_name: area_name,
        ip_addr: ip_addr,
        latitude: latitudeString,
        longitude: longitudeString,
      },
    });
    console.log(data);

    const refreshToken = req.cookies.refreshToken;

    const user = await prisma.users.findMany({
      where: {
        token: refreshToken,
      },
      select: {
        nama: true,
        id: true,
      },
    });

    const namaUser = user[0].nama;
    const userId = user[0].id;

    const logs = await prisma.log.create({
      data: {
        area_name: area_name,
        nama_user: namaUser,
        users: {
          connect: {
            id: userId, // ID pengguna yang sudah ada
          },
        },
        dblocker: {
          connect: {
            id: Number(req.params.id), // ID objek dblocker yang sudah ada
          },
        },
      },
    });

    // Mendapatkan objek tanggal dari createdAt
    const createdAtDate = data.createdAt;

    // Memformat tanggal menjadi "DD-MM-YYYY HH:mm:ss"
    const day = createdAtDate.getDate().toString().padStart(2, "0");
    const month = (createdAtDate.getMonth() + 1).toString().padStart(2, "0");
    const year = createdAtDate.getFullYear();

    const tgl_aktif = `${day}-${month}-${year}`;

    res.status(201).json({
      status: "Success",
      data: {
        id: data.id,
        no_seri: data.nomor_seri,
        ip_addr: data.ip_addr,
        area_name: data.area_name,
        location: [latitude, longitude],
        tgl_aktif: tgl_aktif,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: "ip already used / error lainya",
    });
  }
};

export const turnDrone = async (req, res) => {
  const { user_id, username, jammer_rc, jammer_gps } = req.body;
  const dblockerId = Number(req.params.id); // Mengambil ID dari parameter URL

  try {
    const refreshToken = req.cookies.refreshToken;

    const user = await prisma.users.findMany({
      where: {
        token: refreshToken,
      },
    });

    const userId = user[0].id;
    const Username = user[0].username;
    const namaUser = user[0].nama;

    const dblockers = await prisma.dblocker.findFirst({
      where: { id: dblockerId },
    });
    console.log(dblockers);

    const ipAddr = dblockers.ip_addr;

    // Memeriksa apakah ID di body request sama dengan ID di URL
    if (userId !== Number(user_id)) {
      return res.status(400).json({
        status: "fail",
        message: "Failed to Switch / Id not valid",
      });
    }
    if (Username !== username) {
      return res.status(400).json({
        status: "fail",
        message: "Username not valid",
      });
    }

    // Kirim data ke ESP8266
    const responseFromESP = await axios.post(`http://${ipAddr}/api/switch`, {
      jammer_rc,
      jammer_gps,
    });

    // console.log(responseFromESP.data);
    const rc = responseFromESP.data.data.jammer_rc;
    const gps = responseFromESP.data.data.jammer_gps;
    const temperature = responseFromESP.data.data.temp;

    // // Perbarui data di database berdasarkan respon dari ESP8266
    // await DblockerApi.update(
    //   {
    //     jammer_rc: responseFromESP.data.jammer_rc_status,
    //     jammer_gps: responseFromESP.data.jammer_gps_status,
    //   },
    //   {
    //     where: { id: userId },
    //   }
    // );

    const logs = await prisma.log.create({
      data: {
        nama_user: namaUser,
        area_name: dblockers.area_name,
        rc_state: rc,
        gps_state: gps,
        temp: temperature,
        users: {
          connect: {
            id: userId, // ID pengguna yang sudah ada
          },
        },
        dblocker: {
          connect: {
            id: dblockers.id, // ID objek dblocker yang sudah ada
          },
        },
      },
      include: {
        dblocker: {
          select: {
            nomor_seri: true,
            ip_addr: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    // Kirim pembaruan ke klien melalui WebSocket
    // io.emit("updateData", {
    //   jammer_rc: responseFromESP.data.jammer_rc_status,
    //   jammer_gps: responseFromESP.data.jammer_gps_status,
    // });

    // Mendapatkan objek tanggal dari createdAt
    const createdAtDate = logs.timestamp;

    // Memformat tanggal menjadi "DD-MM-YYYY HH:mm:ss"
    const day = createdAtDate.getDate().toString().padStart(2, "0");
    const month = (createdAtDate.getMonth() + 1).toString().padStart(2, "0");
    const year = createdAtDate.getFullYear();
    // const hours = createdAtDate.getHours().toString().padStart(2, "0");
    // const minutes = createdAtDate.getMinutes().toString().padStart(2, "0");
    // const seconds = createdAtDate.getSeconds().toString().padStart(2, "0");

    const tgl_aktif = `${day}-${month}-${year}`;

    res.json({
      status: "success",
      data: {
        id: logs.id,
        no_seri: logs.dblocker.nomor_seri,
        ip_addr: logs.dblocker.ip_addr,
        location: `${logs.dblocker.latitude},${logs.dblocker.longitude}`,
        tgl_aktif: tgl_aktif,
        jammer_rc: logs.rc_state,
        jammer_gps: logs.gps_state,
        temp: logs.temp,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "fail",
      message: "Failed to Switch / Id not valid",
    });
  }
};

export const deleteDrone = async (req, res) => {
  try {
    const drone = await prisma.dblocker.findFirst({
      where: {
        id: Number(req.params.id),
      },
    });
    if (!drone)
      return res.status(400).json({
        status: "fail",
        message: `Failed to delete [${req.params.id}] atau [${req.params.id}] not found`,
      });

    await prisma.log.deleteMany({
      where: {
        dblocker_id: drone.id,
      },
    });
    const data = await prisma.dblocker.delete({
      where: {
        id: drone.id,
      },
    });
    res.status(200).json({
      status: "success",
      message: `[${data.id}] removed`,
    });
  } catch (error) {
    console.error(error); // Catat error untuk tujuan debugging

    return res.status(500).json({
      status: "error",
      message: "Error server internal",
    });
  }
};
