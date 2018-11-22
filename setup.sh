#!/bin/bash

npm install
sudo apt install -y fortune
pip3 install postcards
postcards generate

echo "Fill in the information in config.json"
