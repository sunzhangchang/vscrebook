import axios from 'axios'
import { error, Errors } from '../utils/error'

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"

export async function fetch(url: string) {
    console.log(url)
    return axios({
        method: 'GET',
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'User-Agent': USER_AGENT
        },
        url,
        responseType: 'arraybuffer'
    }).then(res => {
        return res
    }).catch(err => {
        console.error(err)
        error(Errors.fetchError)
        return null
    })
}
