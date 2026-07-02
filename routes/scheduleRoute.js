const express = require("express")
const axios = require("axios")
const createLog = require("../utils/logger")
const router = express.Router()
const accessToken = process.env.accessToken
function getBestSchedule(vehicleList, mechanicHours) {
    const taskCount = vehicleList.length

    const dp = Array(taskCount + 1)
        .fill(0)
        .map(() => Array(mechanicHours + 1).fill(0))

    for (let taskIndex = 1; taskIndex <= taskCount; taskIndex++) {
        const currentVehicle = vehicleList[taskIndex - 1]

        for (let currentHour = 0; currentHour <= mechanicHours; currentHour++) {
            if (currentVehicle.Duration <= currentHour) {
                dp[taskIndex][currentHour] = Math.max(
                    currentVehicle.Impact +
                    dp[taskIndex - 1][currentHour - currentVehicle.Duration],
                    dp[taskIndex - 1][currentHour]
                )
            } else {
                dp[taskIndex][currentHour] =
                    dp[taskIndex - 1][currentHour]
            }
        }
    }

    const selectedTasks = []

    let remainingHours = mechanicHours

    for (let taskIndex = taskCount; taskIndex > 0; taskIndex--) {
        if (
            dp[taskIndex][remainingHours] !==
            dp[taskIndex - 1][remainingHours]
        ) {
            selectedTasks.push(vehicleList[taskIndex - 1])

            remainingHours -= vehicleList[taskIndex - 1].Duration
        }
    }

    return {
        totalImpact: dp[taskCount][mechanicHours],
        totalHoursUsed: mechanicHours - remainingHours,
        selectedTasks: selectedTasks.reverse()
    }
}

router.get("/schedule", async (req, res) => {
    try {
        createLog(
            "info",
            "route",
            "schedule endpoint called"
        )

        const depotResponse = await axios.get(
            "http://4.224.186.213/evaluation-service/depots",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        createLog(
            "info",
            "service",
            "depot data fetched"
        )

        const vehicleResponse = await axios.get(
            "http://4.224.186.213/evaluation-service/vehicles",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        createLog(
            "info",
            "service",
            "vehicle data fetched"
        )

        const result = []

        for (const depot of depotResponse.data.depots) {
            const bestSchedule = getBestSchedule(
                vehicleResponse.data.vehicles,
                depot.MechanicHours
            )

            result.push({
    depotId: depot.ID,
    mechanicHours: depot.MechanicHours,
    totalImpact: bestSchedule.totalImpact,
    totalHoursUsed: bestSchedule.totalHoursUsed,
    selectedTaskCount: bestSchedule.selectedTasks.length,
    selectedTaskIds: bestSchedule.selectedTasks.map(task => task.TaskID)
})
        }

        createLog(
            "info",
            "service",
            "schedule generated successfully"
        )

        res.json(result)
    }
    catch (error) {
        createLog(
            "error",
            "handler",
            error.message
        )

        res.status(500).json({
            message: "unable to generate schedule"
        })
    }
})

module.exports = router