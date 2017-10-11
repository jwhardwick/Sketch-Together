Vue.component('draw', {

    template: `

        <div>
            <div class="modal is-active" v-if="isEnterNameActive">
              <div class="modal-background">
                <h1>background</h1>
              </div>
                  <div class="modal-content" style="">
                        <div class="field has-addons">
                          <div class="control">
                            <input class="input" type="text" placeholder="Enter your name..." v-model="mouse.name" v-on:keyup.enter="isEnterNameActive = false">
                          </div>
                          <div class="control">
                            <a class="button is-success" @click="isEnterNameActive = false">
                              Continue
                            </a>
                          </div>
                        </div>
                    </div>
              </div>

            <div style="float:left;padding-top:5%;max-width:10%;">
                <a class="button is-light" style="margin-top:5px;" @click="decrementLineWidth">-</a>
                <br>
                <a class="button is-light" style="margin-top:5px;" @click="incrementLineWidth">+</a>
                <br>
                <a class="button is-light" style="margin-top:5px;" @click="mouse.color = getRandomColor()">Color</a>
            </div>

            <div style="width:80%;margin-left:10%;margin-right:10%;background-color:white;">

                <canvas id="canvas" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp" v-on:mousemove="handleMouseMove" >



                </canvas>
            </div>
        </div>

    `,

    name: 'draw',

    data() {
        return {
            isEnterNameActive: true,
            canvas:     null,
            context:    null,
            rect:       null,
            socket:     null,
            down:       false,
            mouse: {
                color: '',
                name: 'Anon',
                lineWidth: 2,
                from: {
                    x: 0,
                    y: 0
                },
                to: {
                    x: 0,
                    y: 0
                }
            }
        }
    },

    methods: {
        decrementLineWidth() {
            this.mouse.lineWidth = Math.max(1, this.mouse.lineWidth - 1)
        },
        incrementLineWidth() {
            this.mouse.lineWidth = Math.min(30, this.mouse.lineWidth + 1)
        },
        handleMouseDown(event) {
            this.down = true
            this.mouse.from = {
                x: event.pageX,
                y: event.pageY
            }
        },
        handleMouseUp() {
            this.down = false
        },
        handleMouseMove(event) {
            this.mouse.to = {
                x: event.pageX,
                y: event.pageY
            }
            if (this.down) {
                this.sendSocket()
            }
        },
        translateMouse() {
            // Translate the coordinates so it will appear in the same spot
        },
        sendSocket(msg) {
            // Send the current mouse coordinates via WebSocket
            if (this.socket.readyState == 1) {
                // Socket is open
                this.socket.send(JSON.stringify(this.mouse))
            }
            else {
                // Connection is down, draw the line anyway
                this.draw(this.mouse)
            }
            // Update mouse position
            this.mouse.from = {
                x: this.mouse.to.x,
                y: this.mouse.to.y
            }
        },
        draw(msg) {

            // Receive WebSocket message and draw line.
            this.context.beginPath()
            this.context.moveTo(msg.from.x - this.rect.left, msg.from.y - this.rect.top)
            this.context.lineTo(msg.to.x - this.rect.left, msg.to.y - this.rect.top)
            this.context.strokeStyle = msg.color
            this.context.lineWidth = msg.lineWidth
            this.context.stroke()
        },
        getRandomColor() {
            // Get a random unassigned color
            const letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        generateColor() {
            const colors = [
                '#004358',
                '#1F8A70',
                '#BEDB39',
                '#FFE11A',
                '#FD7400'
            ]
            return colors[Math.floor(Math.random() * colors.length)]
        }

    },

    mounted() {
        // Setup our user
        this.mouse.color = this.getRandomColor()
        // Get their name


        // Setup canvas to draw on
        this.canvas         = document.getElementById('canvas')
        this.canvas.width   = window.innerWidth * .79
        this.canvas.height  = Math.min(window.innerHeight, 800)
        this.context        = this.canvas.getContext('2d')
        this.rect           = this.canvas.getBoundingClientRect()
        this.context.translate(0.5, 0.5)
        this.context.imageSmoothingEnabled = false
    },

    created() {


        // Create a socket instance
        this.socket = new WebSocket('ws://localhost:8082/ws')

        // Setup Listener
        const vm = this
        this.socket.onopen = function(event) {
        	// Listen for messages
        	vm.socket.onmessage = function(event) {
        		// console.log('Client received a message',event.data)
                try {
                    const msg = JSON.parse(event.data)
                    vm.draw(msg)
                }
                catch(err) {
                    try {
                        const messages = event.data.split('\n')
                        for (var i = 0; i < messages.length; i++) {
                            const msg = JSON.parse(messages[i])
                            vm.draw(msg)
                        }
                    }
                    catch(err) {
                    }
                }


        	}
        	// Listen for socket closes
        	vm.socket.onclose = function(event) {
        		console.log('Client notified socket has closed',event)
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
