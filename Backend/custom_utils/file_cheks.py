import re

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

def allowed_edges_file_content(file):
    with open(file) as f:
        return re.fullmatch(r"(\d+ +\d+( +{\d*})?(\n|\%|\Z))+", f.read()) != None

def allowed_vl_file_content(file):
    with open(file) as f:
        return re.fullmatch(r"((0|1)\.?[0-9]*(;|\n|\Z|\%) ?)+", f.read()) != None

def allowed_labels_file_content(file):
    with open(file) as f:
        return re.fullmatch(r"((\w+( |&|/|-)*)+(;|\%|\Z|\n) ?)+", f.read()) != None

def file_content_check(user_data_path, edges_filename, vl_filename, label_names_filename):
    return allowed_edges_file_content(user_data_path / edges_filename) and \
           allowed_vl_file_content(user_data_path / vl_filename) and \
           allowed_labels_file_content(user_data_path / label_names_filename)