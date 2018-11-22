# Postcard creator

This script is used for downloading photos from [Amazon Phtos](https://www.amazon.com/photos) album and making postcards out of them.

Postcard creation is done using [Postcards](https://github.com/abertschi/postcards). Follow the instruction from that page on how to 
fill `config.json` file.

## Usage

In order to just download images use following steps:

1. Create album on Amazon Photos.
2. Share it via `share link`
3. Copy share ID from the link (`https://www.amazon.com/photos/share/sharelinkidsharelinkidsharelink`)
4. Invoke script with id from url: `./image_downloader.js sharelinkidsharelinkidsharelink`
5. Images will be downloaded in archive.zip

To download images and create one postcard run following steps:
1. Create album on Amazon Photos.
2. Share it via `share link`
3. Copy share ID from the link (`https://www.amazon.com/photos/share/sharelinkidsharelinkidsharelink`)
4. Invoke script `./print_postcard.sh sharelinkidsharelinkidsharelink`

Postcard will be created and sent to your address.

Photos from the album will be stored in `pictures` dir and once they have been send, they will be moved to `sent` dir.



