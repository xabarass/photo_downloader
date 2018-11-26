#!/bin/bash

set -e

BASEDIR="$(dirname "$(readlink -f "$0")")"

PICTURES_DIR="$BASEDIR/pictures"
SENT_PHOTOS="$BASEDIR/sent"
IMAGE_DOWNLOADER_SCRIPT="$BASEDIR/image_downloader.js"
ARCHIVE_FILE="$BASEDIR/archive.zip"

function die(){
	echo "$@"
	exit 1
}

function updateImages(){
	mkdir -p "$PICTURES_DIR"
	mkdir -p "$SENT_PHOTOS"

	echo "Updating image galery"
	rm -f "$ARCHIVE_FILE"
	"$IMAGE_DOWNLOADER_SCRIPT" "$1" "$BASEDIR"

	if [ -f "$ARCHIVE_FILE" ]; then
		echo "Done downloading archive"
		unzip "$ARCHIVE_FILE" -d "$PICTURES_DIR"
	else
		echo "No new images added"
	fi
}

function sendPostcard(){
	# TODO: Figure out how to print heic format!
	images=($(find "$PICTURES_DIR" -type f -type f -name "*.jpeg" -o -name "*.jpg"))
	
	if [ "${#images[@]}" -eq 0 ]; then
		echo "No more images for sending!"
		exit
	fi

	downloading_picture="${images[0]}"
	quote="$(fortune)"

	echo "Downloading picture: $downloading_picture"
	echo "With following quote: $quote"

	postcards send --config config.json --picture "$downloading_picture" --message "$quote"

	mv "$downloading_picture" "$SENT_PHOTOS"

	echo "Done!"
}

if [ "$#" -ne 1 ]; then
	die "No share ID provided"
fi

echo "$BASEDIR"

updateImages "$1"
sendPostcard


