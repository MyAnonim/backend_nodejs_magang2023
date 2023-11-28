import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLogs = async (req, res) => {
  const { date_from, date_to } = req.body;

  try {
    // Pengecekan apakah parameter tanggal ada
    if (!date_from || !date_to) {
      return res.status(400).json({
        status: "fail",
        message: "Error fetching data",
      });
    }

    const logs = await prisma.log.findMany({
      where: {
        timestamp: {
          gte: new Date(date_from),
          lte: new Date(date_to),
        },
      },
    });
    console.log(logs);

    // Pengecekan apakah logs tidak kosong
    if (logs.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          logs: [],
        },
      });
    }

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: new Date(log.timestamp).toLocaleDateString("en-US"), // Format sesuai keinginan Anda
      users_id: log.users_id,
      nama_user: log.nama_user,
      dblocker_id: log.dblocker_id,
      area_name: log.area_name,
      rc_state: log.rc_state,
      gps_state: log.gps_state,
      temp: log.temp,
    }));

    res.status(200).json({
      status: "success",
      data: {
        logs: formattedLogs,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Error fetching data",
    });
  }
};

export const getLogsById = async (req, res) => {
  const { date_from, date_to } = req.body;

  try {
    // Pengecekan apakah parameter tanggal ada
    if (!date_from || !date_to) {
      return res.status(400).json({
        status: "fail",
        message: "Error fetching data",
      });
    }

    const logs = await prisma.log.findMany({
      where: {
        id: Number(req.params.id),
        timestamp: {
          gte: new Date(date_from),
          lte: new Date(date_to),
        },
      },
    });
    console.log(logs);

    // Pengecekan apakah logs tidak kosong
    if (logs.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          logs: [],
        },
      });
    }

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: new Date(log.timestamp).toLocaleDateString("en-US"), // Format sesuai keinginan Anda
      users_id: log.users_id,
      nama_user: log.nama_user,
      dblocker_id: log.dblocker_id,
      area_name: log.area_name,
      rc_state: log.rc_state,
      gps_state: log.gps_state,
      temp: log.temp,
    }));

    res.status(200).json({
      status: "success",
      data: {
        logs: formattedLogs,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Error fetching data",
    });
  }
};
