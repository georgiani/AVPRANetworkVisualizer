import os, time, shutil

def get_new_data_folder(custom_examples_path, max_users):
    dir_list = get_dir_list(custom_examples_path)
    for i in range(0, max_users):
        if str(i) not in dir_list:
            return str(i)

def folder_age_in_hours(d):
    return int((time.time() - os.path.getmtime(d)) / 3600)

def get_dir_list(custom_examples_path):
    return [d for d in os.listdir(custom_examples_path) if (custom_examples_path / d).is_dir()]

def cleanup_personal_folders(custom_examples_path):
    if not custom_examples_path.exists():
        return
    dir_list = get_dir_list(custom_examples_path)
    for d in dir_list:
        if folder_age_in_hours(custom_examples_path / d) >= 1:
            shutil.rmtree(custom_examples_path / d)