#!/usr/bin/env node

const buildUrl = require('build-url');
const url = require('url');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const BASE_URL="https://www.amazon.com/drive/v1/"

function downloadSharedGalery(galeryId){
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
			nodeIds.push(element.ownerId+":"+element.id)
		})
		compressImagesRequest.nodeIds=nodeIds

		return axios.post(batchLinkUrl, compressImagesRequest);
	})
	.then(response => {
		var file = fs.createWriteStream("archive.zip");

		var request = https.get(response.data.links.content, function(response) {
			response.pipe(file);
		});
	})
	.catch(error => {
		console.log(error)
	})
}

if (process.argv.length<3){
	console.log("Not enough arguments");
}else{
	downloadSharedGalery(process.argv[2])
}



