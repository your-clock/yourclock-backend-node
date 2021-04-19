const relojModel = require('../../models/reloj')

const error305 = {
	code: 305,
	msg: "faltaron datos"
}

exports.setData = (req, res) => {
    const data = req.body

	if(!data.temp_amb || !data.temp_local){
		res.status(400).json(error305)
	}else{
        console.log(data)
        relojModel.emitData(data, function(err, result) {
            res.send("OK")
        })
	}
}

exports.setAlarm = (req, res) => {
	const time = req.body.time
	if(!time){
		res.status(400).json(error305)
	}else{
		relojModel.sendAlarm(time, (err, result) => {
			if(err){
				return res.status(400).send(err)
			}else{
				return res.status(200).send(result)
			}
		})
	}
}
