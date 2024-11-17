import os

def str_to_bool(value):
    """
    Convert a string to a boolean.
    """
    return value.lower() in ("true", "1", "yes")
