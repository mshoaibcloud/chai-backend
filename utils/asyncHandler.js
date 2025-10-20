//higher-fn-concept 
// const asyncHandler = (fn) => {() =>{}};
//const asyncHandler = (fn) => () =>{};

// 1-way
// const asyncHandler = (fn) => async (req,res,next) =>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500)
//         .json({
//             success:false,
//             message: err.message
//         })
//     }
// };

// 2nd-way
const asyncHandler = (requestHandler) =>{
    return (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=> next(err))
    }
    //return
}

// from nodejs api documents


export {asyncHandler}