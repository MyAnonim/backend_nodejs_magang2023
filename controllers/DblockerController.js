import { PrismaClient } from "@prisma/client";
import { time } from "console";

const prisma = new PrismaClient();

export const getDrone = async (req, res) => {
  try {
    const data = await prisma.dblocker.findMany({
      include: {
        log: {
          select: {
            rc_state: true,
            gps_state: true,
          },
        },
      },
    });

    const dblockers = data.map((dblocker) => {
      const { id, nomor_seri, ip_addr, latitude, longitude, createdAt, log } =
        dblocker;
      const jammer_rc = log[0].rc_state;
      const jammer_gps = log[0].gps_state;

      return {
        id,
        no_seri: nomor_seri,
        ip_addr,
        latitude,
        longitude,
        tgl_aktif: createdAt,
        jammer_rc,
        jammer_gps,
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
          },
        },
      },
    });

    const dblockers = data.map((dblocker) => {
      const { id, nomor_seri, ip_addr, location, createdAt, log } = dblocker;
      const jammer_rc = log[0].rc_state;
      const jammer_gps = log[0].gps_state;

      return {
        id,
        no_seri: nomor_seri,
        ip_addr,
        location: location,
        tgl_aktif: createdAt,
        jammer_rc,
        jammer_gps,
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
  const { nomor_seri, area_name, ip_addr, latitude, longitude } = req.body;

  try {
    const refreshToken = req.cookies.refreshToken;

    const user = await prisma.users.findMany({
      where: {
        token: refreshToken,
      },
    });

    const dblockers = await prisma.dblocker.create({
      data: {
        nomor_seri: nomor_seri,
        area_name: area_name,
        ip_addr: ip_addr,
        latitude: latitude,
        longitude: longitude,
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

    res.status(201).json({
      status: "success",
      data: {
        id: dblockers.id,
        no_seri: nomor_seri,
        ip_addr: ip_addr,
        latitude: latitude,
        longitude: longitude,
        tgl_aktif: dblockers.createdAt,
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
  const { nomor_seri, area_name, ip_addr, latitude, longitude } = req.body;

  try {
    const data = await prisma.dblocker.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        nomor_seri: nomor_seri,
        area_name: area_name,
        ip_addr: ip_addr,
        latitude: latitude,
        longitude: longitude,
      },
    });
    console.log(data);

    const logs = await prisma.log.update({
      where: {
        id: data.id,
      },
      data: {
        area_name: area_name,
      },
      select: {
        rc_state: true,
        gps_state: true,
      },
    });

    res.status(201).json({
      status: "Success Update Drone",
      data: {
        id: data.id,
        no_seri: data.nomor_seri,
        ip_addr: data.ip_addr,
        latitude: data.latitude,
        longitude: data.longitude,
        tgl_aktif: data.createdAt,
        jammer_rc: logs.rc_state,
        jammer_gps: logs.gps_state,
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
  const { user_id, dblocker_id, jammer_rc, jammer_gps } = req.body;
  const idUser = Number(req.params.id); // Mengambil ID dari parameter URL

  try {
    const refreshToken = req.cookies.refreshToken;

    const user = await prisma.users.findMany({
      where: {
        token: refreshToken,
      },
    });
    const userId = user[0].id;
    const namaUser = user[0].nama;
    console.log(user);

    const dblockers = await prisma.dblocker.findFirst({
      where: { id: Number(dblocker_id) },
    });

    if (!userId || userId.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "ID user tidak ditemukan",
      });
    }
    // Memeriksa apakah ID di body request sama dengan ID di token login
    if (idUser !== userId) {
      return res.status(400).json({
        status: "fail",
        message: "ID login tidak sesuai",
      });
    }
    // Memeriksa apakah ID di body request sama dengan ID di URL
    if (idUser !== Number(user_id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID tidak sesuai",
      });
    }

    // // Kirim data ke ESP8266
    // const responseFromESP = await axios.post(`http://${ip_addr}`, {
    //   jammer_rc,
    //   jammer_gps,
    // });

    // console.log(responseFromESP.data);

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

    const logs = await prisma.log.update({
      where: { id: dblockers.id },
      data: {
        users_id: userId,
        nama_user: namaUser,
        rc_state: jammer_rc,
        gps_state: jammer_gps,
      },
      include: {
        dblocker: {
          select: {
            nomor_seri: true,
            ip_addr: true,
            location: true,
          },
        },
      },
    });

    // Kirim pembaruan ke klien melalui WebSocket
    // io.emit("updateData", {
    //   jammer_rc: responseFromESP.data.jammer_rc_status,
    //   jammer_gps: responseFromESP.data.jammer_gps_status,
    // });

    res.json({
      status: "success",
      data: {
        id: logs.id,
        no_seri: logs.dblocker.nomor_seri,
        ip_addr: logs.dblocker.ip_addr,
        location: logs.dblocker.location,
        tgl_aktif: logs.timestamp,
        jammer_rc: logs.rc_state,
        jammer_gps: logs.gps_state,
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
      return res.status(404).json({ msg: "Id Drone tidak ditemukan" });

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
      status: "Success Delete Drone",
      data,
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
