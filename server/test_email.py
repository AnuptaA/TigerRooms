import requests
from dotenv import load_dotenv
import os

load_dotenv()

def send_simple_message():
  	return requests.post(
  		"https://api.mailgun.net/v3/sandbox3a13960088544fad8ca55b092a8c9564.mailgun.org/messages",
  		auth=("api", os.getenv("MAILGUN_API_KEY")),
  		data={"from": "TigerRoomsTeam <tigerroomsteam@gmail.com>",
  			"to": ["ky6374@princeton.edu"],
  			"subject": "Hello GIRLY",
  			"text": "I LOVE YOU MAILGUN HOPEFULLY THIS WORKS ON RENDER!!!"})

send_simple_message()