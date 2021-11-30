from flask import Flask, render_template, request, jsonify
from flask.helpers import send_file
from data_process import *

app = Flask(__name__)

dp = DataProcess()

@app.route("/")
def front_end_resp():
    return render_template("index.html")

@app.route("/query")
def query():
    if request.args.get("type") == "all_shops":
        sff = float(request.args.get("sff"))
        sft = float(request.args.get("sft"))
        pff = float(request.args.get("pff"))
        pft = float(request.args.get("pft"))
        cf = float(request.args.get("cf"))
        ct = float(request.args.get("ct"))
        uid = request.args.get("uid")
        tr = int(request.args.get("tr"))
        kw = request.args.get("kw")
        return jsonify( dp.get_all_shops( filter_=[sff,sft,pff,pft,cf,ct,uid,tr,kw]) )
    if request.args.get("type") == "shop_detail":
        poiid = request.args.get("poiid")
        return jsonify( dp.get_shop_detail(poiid) )
    return "null"

@app.route("/wordcloud")
def wordcloud():
    meal_only = request.args.get("meal_only")=="1"
    if request.args.get("type") == "shop":
        return send_file( wordcloudgen(dp,request.args.get("id"),"shop",meal_only), mimetype='image/png', as_attachment=False )
    if request.args.get("type") == "user":
        pass
    return send_file( wordcloudgen(dp), mimetype='image/png', as_attachment=False )

app.run(debug=True)