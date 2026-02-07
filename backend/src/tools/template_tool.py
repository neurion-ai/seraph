from smolagents import tool


@tool
def fill_template(template: str, variables: dict) -> str:
    """Fill a template string with the provided variables. Uses Python str.format_map() style placeholders like {variable_name}.

    Args:
        template: A template string with {placeholder} style variables.
        variables: A dictionary mapping placeholder names to their values.

    Returns:
        The template with placeholders replaced by their values.
    """
    try:
        return template.format_map(variables)
    except KeyError as e:
        return f"Error: Missing template variable {e}"
    except Exception as e:
        return f"Error filling template: {e}"
