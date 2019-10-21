import re
import os
from datetime import datetime

from flask import Flask, render_template
from flask import Markup
import markdown2


# pylint: disable=C0103
app = Flask(__name__, static_url_path="/static")


@app.route("/")
def main():
    json_dir = "static/json"
    all_graph_files = os.listdir(json_dir)
    last_modified_zip = [(file_name, os.path.getmtime(json_dir + "/" + file_name)) for file_name in all_graph_files]

    last_modified_zip.sort(key=(lambda x: x[1]), reverse=True)
    sorted_graph_names = [tup[0] for tup in last_modified_zip]
    all_graph_names = [json_file_name.split(".")[0] for json_file_name in sorted_graph_names]

    sorted_modified_dates = [datetime.fromtimestamp(tup[1]) for tup in last_modified_zip]
    clean_mod_dates = [date.strftime("%m-%d %H:%M:%S") for date in sorted_modified_dates]
    return render_template("index.html", all_graph_names=all_graph_names, sorted_modified_dates=clean_mod_dates)


@app.route("/graph/<graphname>")
def view_graph(graphname):
    return render_template("graph.html", graph_name=graphname)


@app.route("/graph_data/<path:path>")
def send_debug_data(path):
    if "md" in path:
        with open("graph_data/" + path, "r") as debug_data_file:
            md_str = debug_data_file.read()
        md_html = markdown2.markdown(md_str, extras=["tables"])

        title_regex = re.search("([^-]*)-[^_]*_(.*).md", path)
        title = title_regex.group(1)

        return render_template(
            "base.html",
            body=Markup(md_html),
            title=title,
            var_description=title_regex.group(1) + " " + title_regex.group(2),
        )
    else:
        file_list = os.listdir("graph_data/" + path)
        dir_list = [(path + "/" + file, file) for file in file_list]
        dir_dict = dict(dir_list)
        return render_template(
            "dir_list.html",
            dir_dict=dir_dict
        )
