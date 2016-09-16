riot.tag2('navigate', '<a href="{opts.to}" onclick="{nagivateToRoute}"><yield></yield></a>', '', '', function(opts) {
        var self = this;
        this.nagivateToRoute = function(e){
            e.preventDefault();
            riot.route(self.opts.to,self.opts.title||null,self.opts.replace?true:false);
        }
});
riot.tag2('route', '<yield></yield>', '', '', function(opts) {
				this.on('mount',(e)=>{
						if(Object.keys(this.tags).length===0){
							this.parent && this.parent.setRoute && this.parent.setRoute(this.opts.path, this.opts.component );
						}
				});

				this.setRoute = function(path, component){
					this.parent && this.parent.setRoute && this.parent.setRoute(this.opts.path + path, component );
				}
});
riot.tag2('router', '<div class="route-container"><yield></yield></div><div class="riot-root"></div>', '', '', function(opts) {
			var self = this;
			var $appRoot = null;
			var currTag = null;

			var routeParams = {};

			function unmountCurrRoute(){
					if(currTag){
							console.log(currTag);
							debugger;
					}
			}

			function createRouteWithTagName(tagName){

					var tag = '<'+tagName+' class="route-'+tagName+'" ';
					for(var param in routeParams){
						tag = tag + param + '="' + routeParams[param] + '" ';
					}
					tag = tag + '></'+tagName+'>';

					unmountCurrRoute();

					$appRoot.innerHTML = tag;
					var mountedTag = riot.mount(tagName+'.route-'+tagName);
					if(mountedTag.length === 0){
							self.trigger('tagNotFound',tagName);
							if(self.opts['on-tagnotfound'] && self.opts['on-tagnotfound'] instanceof Function){
								self.opts['on-tagnotfound'](tagName);
							}

					}
					else{
							self.trigger('routeChanged',tagName);
							if(self.opts['on-routechange'] && self.opts['on-routechange'] instanceof Function){
								self.opts['on-routechange'](tagName);
							}
							currTag = mountedTag[0];
					}
			}

			function changeRoute(newRoute){
					if(typeof(newRoute) === 'string'){
							createRouteWithTagName(newRoute);
					} else if ((window.Promise) && (newRoute instanceof window.Promise)){
							newRoute.then(tagName  => {
								createRouteWithTagName(tagName);
							});
					}
			}

			this.setRoute = function(path, component){
					(function(path, component){

							var tokenRegExp = /:([a-z]*)/ig;

							var params = path.match(tokenRegExp);
							params = params && params.map(param => param.length>0 ? param.substring(1): '') || params;

							path = path.replace(tokenRegExp,'*');

							riot.route(path,function() {

									routeParams={};

									params && params.forEach((param,index) => {
										routeParams[param] = arguments[index];
									});

									changeRoute(component);
							});

							riot.route.start(true);
					})(path, component)
			}

			this.on('mount',(e)=>{

					if(!this.opts.showRoutes){
						var routeContainer = this.root.querySelector('.route-container');
						routeContainer.remove && routeContainer.remove();
					}
					$appRoot = this.root.querySelector('.riot-root');

			});
});


