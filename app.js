Vue.component('draw', {

    template: `

<div>
    <div class="modal is-active" v-if="welcomePage" style="z-index:9999;">
        <div class="modal-background">
        </div>
        <div class="modal-content" style="">
            <div class="field has-addons">
                <div class="control" style="margin-left:auto;">
                    <input class="input" type="text" placeholder="Enter your name..." v-model="mouse.name" v-on:keyup.enter="closeWelcomePage">
                </div>
                <div class="control" style="margin-right:auto;">
                    <a class="button is-success" @click="closeWelcomePage">
                              Continue
                    </a>
                </div>
            </div>
        </div>
    </div>


    <section style="height:50px;">
        <div style="width:600px;margin:auto;text-align:center;">
            <a class="button is-light" style="margin:5px;" @click="decrementLineWidth">
                <span class="icon is-small">
                  <i class="fa fa-minus"></i>
                </span>
            </a>
            <a class="button is-light" style="margin:5px;" @click="incrementLineWidth">
                <span class="icon is-small">
                  <i class="fa fa-plus"></i>
                </span>
            </a>
            <a class="button is-light" style="margin:5px;" @click="clearCanvas">Clear Canvas</a>
            <a class="button is-light" style="margin:5px;" @click="clearCursors">Clear Cursors</a>

        </div>

    </section>

    <div style="width:600px;height:800px;margin:auto;background-color:white;">

        <p v-for="cursor in cursors" :key="cursor.color" v-if="cursor.color" v-bind:style="{ left: cursor.x + 'px', top: cursor.y + 'px', color: cursor.color, opacity: cursor.opacity }" style="position:absolute;width:25px !important; display:block;
        z-index:9998;-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; opacity:1; " >


            <i class="fa fa-mouse-pointer" aria-hidden="true"></i>{{ cursor.name }}



        </p>


        <canvas id="canvas" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp" v-on:mousemove="handleMouseMove">

        </canvas>
    </div>
</div>

    `,

    name: 'draw',

    data() {
        return {
            welcomePage: true,
            canvas: null,
            context: null,
            rect: null,
            socket: null,
            mouse: {
                down: false,
                color: '',
                name: '',
                lineWidth: 2,
                from: {
                    x: 0,
                    y: 0
                },
                to: {
                    x: 0,
                    y: 0
                }
            },
            cursors: {}
        }
    },

    computed: {
        translateMouse() {
            return {
                down:       this.mouse.down,
                color:      this.mouse.color,
                name:       this.mouse.name,
                lineWidth:  this.mouse.lineWidth,
                from:   {
                    x:  this.mouse.from.x - this.rect.left,
                    y:  this.mouse.from.y - this.rect.top
                },
                to:     {
                    x:  this.mouse.to.x - this.rect.left,
                    y:  this.mouse.to.y - this.rect.top
                }
            }
        }
    },

    methods: {
        closeWelcomePage() {
            this.clearCursors()
            this.welcomePage = false
            if (this.mouse.name == '') {
                this.mouse.name = this.mouse.color
            }
        },
        clearCursors() {
            this.cursors = {}
        },
        clearCanvas() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        },
        decrementLineWidth() {
            this.mouse.lineWidth = Math.max(1, this.mouse.lineWidth - 1)
        },
        incrementLineWidth() {
            this.mouse.lineWidth = Math.min(30, this.mouse.lineWidth + 1)
        },
        handleMouseDown(event) {
            this.mouse.down = true
            this.mouse.from = {
                x: event.pageX,
                y: event.pageY
            }
        },
        handleMouseUp() {
            this.mouse.down = false
        },
        handleMouseMove(event) {
            this.mouse.to = {
                x: event.pageX,
                y: event.pageY
            }
            this.sendSocket(this.translateMouse)
        },
        sendSocket(msg) {
            // Send the current mouse coordinates via WebSocket
            if (this.socket.readyState == 1) {
                // Socket is open
                this.socket.send(JSON.stringify(msg))
            } else {
                // Connection is down, draw the line anyway
                if (msg.down) {
                    this.draw(msg)
                }
            }
            // Update mouse position
            this.mouse.from = {
                x: this.mouse.to.x,
                y: this.mouse.to.y
            }
        },
        getSocket(msg) {
            if (msg.close) {
                this.$set(this.cursors, msg.color, {})
            } else {
                this.trackCursor(msg)
                if (msg.down) {
                    this.draw(msg)
                }
            }
        },
        draw(msg) {
            // Draw onto the canvas
            this.context.beginPath()
            this.context.moveTo(msg.from.x, msg.from.y)
            this.context.lineTo(msg.to.x, msg.to.y)
            this.context.strokeStyle = msg.color
            this.context.lineWidth = msg.lineWidth
            this.context.stroke()
        },
        trackCursor(msg) {
            // Track cursors for other users only
            if (!this.welcomePage && this.mouse.color != msg.color) {
                const newCursor = {
                    x:      msg.to.x + this.rect.left,
                    y:      msg.to.y + this.rect.top,
                    name:   msg.name,
                    color:  msg.color,
                    opacity:1,
                }
                this.$set(this.cursors, msg.color, newCursor)
            }
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
        },
        closeConnection() {
            this.sendSocket({close: true, color: this.mouse.color})
            this.socket.close()
        }

    },

    mounted() {
        // Setup our user
        this.mouse.color = this.getRandomColor()
        // Get their name

        // Setup canvas to draw on
        this.canvas = document.getElementById('canvas')
        this.canvas.width = 600
        this.canvas.height = 800
        this.context = this.canvas.getContext('2d')
        this.rect = this.canvas.getBoundingClientRect()
        this.context.translate(0.5, 0.5)
        this.context.imageSmoothingEnabled = false

    },

    created() {
        const vm = this

        // Create a socket instance
        this.socket = new WebSocket('ws://localhost:8082/ws')

        // Setup Listener
        this.socket.onopen = function(event) {
            // Listen for messages
            vm.socket.onmessage = function(event) {
                // console.log('Client received a message',event.data)
                try {
                    const msg = JSON.parse(event.data)
                    vm.getSocket(msg)
                } catch (err) {
                    try {
                        const messages = event.data.split('\n')
                        for (var i = 0; i < messages.length; i++) {
                            const msg = JSON.parse(messages[i])
                            vm.getSocket(msg)
                        }
                    } catch (err) {}
                }


            }
            // Listen for socket closes
            vm.socket.onclose = function(event) {
            }
        }
    }
})

new Vue({

    el: '#root'

})
