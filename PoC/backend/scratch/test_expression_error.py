def poisson_helper(x, mean, cumulative=True):
    return 0.5 # dummy

all_func = lambda *args: all(args[0] if isinstance(args[0], (list, tuple)) else args)
any_func = lambda *args: any(args[0] if isinstance(args[0], (list, tuple)) else args)

# Test the expression that failed
# IF(AND({K}=0, {I}=0, {D}>0), {D}, 0) + IF(OR({A}='47145-268', {A}='30042-0601'), 1, 0)
# becomes something like this after processing:
eval_expr = "(60.0 if all_func(0.0==0, 0.0==0, 60.0>0) else 0) + (1 if any_func('350E053022727'=='47145-268', '350E053022727'=='30042-0601') else 0)"

try:
    val = eval(eval_expr, {"all_func": all_func, "any_func": any_func, "TRUE": True, "FALSE": False})
    print(f"Eval result: {val}")
except Exception as e:
    print(f"Eval failed: {e}")
