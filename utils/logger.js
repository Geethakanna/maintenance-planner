const axios = require("axios")
const accessToken = process.env.accessToken
function createLog(level, packageName, message) {
    axios.post(
        "http://20.244.56.144/evaluation-service/logs",
        {
            stack: "backend",
            level,
            package: packageName,
            message
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    ).catch(() => {})
}

module.exports = createLog