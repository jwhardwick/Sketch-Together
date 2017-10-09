Vue.component('draw', {

    template: `
        <canvas id="canvas" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp" v-on:mousemove="handleMouseMove" width="800px" height="800px"></canvas>
    `,

    name: 'draw',

    data() {
        return {
            canvas: null,
            context: null,
            rect: null,
            socket: null,
            mouse: {
                userColor: '',
                from: {
                    x: 0,
                    y: 0
                },
                to: {
                    x: 0,
                    y: 0
                }
            },
            users: {},
            down: false
        }
    },

    computed: {
        currentMouse() {
            var c = document.getElementById('canvas')
            var rect = c.getBoundingClientRect()

            return {
                x: this.mouse.x - rect.left,
                y: this.mouse.y - rect.top
            }
        }
    },

    methods: {
        draw(event) {
            if (this.down) {
                // console.log('draw')
                // console.log(this.currentMouse.x, this.currentMouse.y)
                this.sendSocket()
            }
        },
        handleMouseDown(event) {
            //   console.log('handleMouseDown')
            this.down = true
            this.mouse.from = {
                x: event.pageX,
                y: event.pageY
            }

            // var c = document.getElementById('canvas')
            // var ctx = c.getContext('2d')
            // var rect = c.getBoundingClientRect()
            // ctx.moveTo(this.mouse.x - rect.left, this.mouse.y - rect.top)
        },
        handleMouseUp() {
            this.down = false
        },
        handleMouseMove(event) {

            this.mouse.to = {
                x: event.pageX,
                y: event.pageY
            }
            //   console.log(this.mouse.current.x, this.mouse.current.y, 'current')
            this.draw(event)
        },
        sendSocket() {
            this.socket.send(JSON.stringify(this.mouse))
            this.mouse.from = {
                x: this.mouse.to.x,
                y: this.mouse.to.y
            }
        },
        getSocket(msg) {


            var c = document.getElementById('canvas')
            var rect = c.getBoundingClientRect()
            var ctx = c.getContext('2d')
            ctx.clearRect(0, 0, 800, 800)
            // ctx.lineTo(this.currentMouse.x, this.currentMouse.y)

            // var xDist = Math.abs(x - this.previous.x)
            // var yDist = Math.abs(y - this.previous.y)
            //
            // if (xDist < 50 && yDist < 50) {
            //     ctx.moveTo(this.previous.x - rect.left, this.previous.y - rect.top)
            // }
            // else {
            //     ctx.moveTo(x - rect.left, y - rect.top)
            // }
            //
            // ctx.lineTo(x - rect.left, y - rect.top)
            // ctx.strokeStyle = this.userColor
            // ctx.lineWidth = 2
            // ctx.stroke()
            //
            // this.previous.x = x
            // this.previous.y = y

            ctx.beginPath()
            ctx.moveTo(msg.from.x - rect.left, msg.from.y - rect.top)
            ctx.lineTo(msg.to.x - rect.left, msg.to.y - rect.top)
            // ctx.moveTo(msg.from.x - rect.left, msg.from.y - rect.top)
            ctx.strokeStyle = msg.userColor
            ctx.lineWidth = 2

            ctx.closePath()
            ctx.stroke()
        },
        getRandomColor() {
            // Get a random unassigned color
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
            }

            return color;
        },
        generateColor() {
            var color = this.getRandomColor()
            // Repeat until we find a unique color
            while (this.users.color != null) {
                color = this.getRandomColor()
            }
            return color
        }
    },

    ready: function() {
        var c = document.getElementById('canvas')
        var ctx = c.getContext('2d')
        ctx.translate(0.5, 0.5)
        ctx.imageSmoothingEnabled = false
    },

    created() {
        // Setup our user
        this.mouse.userColor = this.generateColor()


        // Create a socket instance
        this.socket = new WebSocket('ws://localhost:8082/ws')
        // Setup Listener
        const vm = this
        this.socket.onopen = function(event) {
            // vm.socket.send(JSON.stringify(vm.mouse))
        	// Listen for messages
        	vm.socket.onmessage = function(event) {
        		console.log('Client received a message',event.data);
                const msg = JSON.parse(event.data)
                vm.getSocket(msg)
        	}
        	// Listen for socket closes
        	vm.socket.onclose = function(event) {
        		console.log('Client notified socket has closed',event);
        	}

        }
    }
})




Vue.component('ping', {

    template: `
        <div>
            <p><input v-model="input.message" type="text"></p>
            <button @click="emitPing">Emit</button>
            <br>
            <p>Response is {{ response.message }}</p>
        </div>
    `,

    data() {
        return {
            response: {
                message: ''
            },
            input: {
                message: 'Hello world!'
            },
            socket: null
        }
    },

    methods: {
        emitPing() {
            this.socket.send(JSON.stringify(this.input))
        }
    },

    created() {
        // Create a socket instance
        this.socket = new WebSocket('ws://localhost:8082/ws')
    },

    mounted() {
        const vm = this
        // this.socket.addEventListener('message', function (event) {
        //     console.log(event.data)
        //     vm.response = event.data
        // })

        this.socket.onopen = function(event) {

        	// Listen for messages
        	vm.socket.onmessage = function(event) {
        		console.log('Client received a message',event.data);
                var jsonObject = JSON.parse(event.data)
                vm.response.message = jsonObject.message
        	};

        	// Listen for socket closes
        	vm.socket.onclose = function(event) {
        		console.log('Client notified socket has closed',event);
        	};

        	// To close the socket....
        	//socket.close()

        };
    }

})

new Vue({

    el: '#root'

})
