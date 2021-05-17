const relojModel = require('../../models/reloj')

exports.setData = async (req, res) => {
	try {
		await relojModel.emitData(req.body, req.headers.device_id)
		res.status(200).send("OK")
	} catch (error) {
		return res.status(error.statusCode || 500).send(error.body || error.toString())
	}
}

exports.setAlarm = async (req, res) => {
	try {
		const response = await relojModel.sendAlarm(req.body.time)
		return res.status(200).json({
			msg: "Alarma configurada exitosamente",
			code: 308,
			info: response
		})
	} catch (error) {
		return res.status(error.statusCode || 500).send(error.body || error.toString())
	}
}
