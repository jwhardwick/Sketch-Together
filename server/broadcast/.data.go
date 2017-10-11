// package main
//
//
//
//
//
//
//
//
//
// func Append(slice, data []byte) []byte {
//     l := len(slice)
//     if l + len(data) > cap(slice) {  // reallocate
//         // Allocate double what's needed, for future growth.
//         newSlice := make([]byte, (l+len(data))*2)
//         // The copy function is predeclared and works for any slice type.
//         copy(newSlice, slice)
//         slice = newSlice
//     }
//     slice = slice[0:l+len(data)]
//     for i, c := range data {
//         slice[l+i] = c
//     }
//     return slice
// }
