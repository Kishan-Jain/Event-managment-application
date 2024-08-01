const asyncHandler = (func) => async (req, res, next) =>  {
    Promise.resolve(func(req, res, next))
    .catch((error) => next(error))
}   

export default asyncHandler