#!/bin/bash

set -e

BASEDIR="$(dirname "$(readlink -f "$0")")"

PICTURES_DIR="$BASEDIR/pictures"
SENT_PHOTOS="$BASEDIR/sent"
IMAGE_DOWNLOADER_SCRIPT="$BASEDIR/image_downloader.js"
ARCHIVE_FILE="$BASEDIR/archive.zip"

function sleepUntil(){
	local END_EPOCH="$(date -d $1 +%s)"
	local CURR_EPOCH="$(date +%s)"

	sleep_seconds=$(( $END_EPOCH - $CURR_EPOCH ))

	echo "Sleeping for: $sleep_seconds"
	sleep "$sleep_seconds"
}

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

	if ! OUTPUT="$(postcards send --config config.json --picture "$downloading_picture" --message "$quote")" ; then
		# We need to sleep until we can send more freee postcards
		NEXT_SEND_TIME="$(echo "$OUTPUT" | tail -n 1 | awk '{print $NF}')"
		sleepUntil "$NEXT_SEND_TIME"
		postcards send --config config.json --picture "$downloading_picture" --message "$quote"
	fi

	mv "$downloading_picture" "$SENT_PHOTOS"

	echo "Done!"
}

if [ "$#" -ne 1 ]; then
	die "No share ID provided"
fi

echo "$BASEDIR"

updateImages "$1"
sendPostcard


