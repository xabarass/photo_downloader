#!/usr/bin/env node

const buildUrl = require('build-url');
const url = require('url');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const BASE_URL="https://www.amazon.com/drive/v1/"
const ARCHIVE_NAME="archive.zip"
const SAVE_FILE="downloaded_images.json"
const GOOD_ERROR="no new images in album"

var existingImages={}

function downloadSharedGalery(galeryId, cb){
	var shareInfoUrl=buildUrl(url.resolve(BASE_URL, "shares/"+galeryId),
		{
			queryParams:{
				shareId:galeryId,
				resourceVersion:"V2",
				ContentType:"JSON"
			}
		});

	axios.get(shareInfoUrl)
	.then(response => {
		var nodesUrl=buildUrl(url.resolve(BASE_URL, "nodes/"+response.data.nodeInfo.id+"/children"),
		{
			queryParams:{
				asset:"ALL",
				limit:1,
				searchOnFamily:false,
				shareId:galeryId,
				offset:0,
				resourceVersion:"V2",
				ContentType:"JSON"
			}
		});

		return axios.get(nodesUrl)	
	}).
	then(response => {
		var nodesUrl=buildUrl(url.resolve(BASE_URL, "nodes/"+response.data.data[0].id+"/children"),
		{
			queryParams:{
				asset:"ALL",
				limit:200,
				searchOnFamily:false,
				shareId:galeryId,
				offset:0,
				resourceVersion:"V2",
				ContentType:"JSON"
			}
		});

		return axios.get(nodesUrl);
	})
	.then(response => {
		var batchLinkUrl=buildUrl(url.resolve(BASE_URL, "batchLink"),
		{
			queryParams:{
				shareId:galeryId,
			}
		});

		compressImagesRequest = {
			ContentType:"JSON"
		}
		nodeIds=[]

		response.data.data.forEach(element => {
			newId=element.ownerId+":"+element.id
			if (!(newId in existingImages)){
				existingImages[newId]=true
				nodeIds.push(newId)
			}
		})

		if (nodeIds.length==0){
			throw new Error(GOOD_ERROR)
		}

		compressImagesRequest.nodeIds=nodeIds

		return axios.post(batchLinkUrl, compressImagesRequest);
	})
	.then(response => {
		var file = fs.createWriteStream(ARCHIVE_NAME);
		var request = https.get(response.data.links.content, function(response) {

			if (response.statusCode !== 200) {
				return cb('Response status was ' + response.statusCode);
			}

			response.pipe(file);

			file.on('finish', function(){
				file.close(cb);
			});
		}).on('error', function(err){
			fs.unlink(ARCHIVE_NAME)
			cb(err)
		})
	})
	.catch(error => {
		cb(error)
	})
}

function saveFile(){
	var json = JSON.stringify(existingImages)
	fs.writeFileSync(SAVE_FILE, json, 'utf8');
}

function loadFile(){
	if (fs.existsSync(SAVE_FILE)){
		var content = fs.readFileSync(SAVE_FILE)
		existingImages=JSON.parse(content)
	}
}

if (process.argv.length<3){
	console.log("Not enough arguments");
}else{
	console.log("Downloading images for share ID: "+process.argv[2])

	loadFile()

	downloadSharedGalery(process.argv[2], error =>{
		if (error && error.message!=GOOD_ERROR){
			console.log(error)
			process.exit(1)
		}
		saveFile()
	})
}



