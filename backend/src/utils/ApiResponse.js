export default class ApiResponse {
    constructor(
        status, data, messege
    ){
        this.status = status
        this.data = data
        this.messege = messege
        this.successMessege = status < 400
    }
}